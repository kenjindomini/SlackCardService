var cribbage_player_1 = require("../../card_service/implementations/cribbage_player");
var cribbage_1 = require("../../card_service/implementations/cribbage");
var cribbage_hand_1 = require("../../card_service/implementations/cribbage_hand");
var card_game_1 = require("../../card_service/base_classes/card_game");
var card_1 = require("../../card_service/base_classes/items/card");
var item_collection_1 = require("../../card_service/base_classes/collections/item_collection");
var request = require("request");
var CribbageRoutes;
(function (CribbageRoutes) {
    var SlackResponseType;
    (function (SlackResponseType) {
        SlackResponseType[SlackResponseType["ephemeral"] = "ephemeral"] = "ephemeral";
        SlackResponseType[SlackResponseType["in_channel"] = "in_channel"] = "in_channel";
    })(SlackResponseType || (SlackResponseType = {}));
    var CribbageAttachmentField = (function () {
        function CribbageAttachmentField(title, value, short) {
            if (title === void 0) { title = ""; }
            if (value === void 0) { value = ""; }
            if (short === void 0) { short = ""; }
            this.title = title;
            this.value = value;
            this.short = short;
        }
        return CribbageAttachmentField;
    })();
    var CribbageResponseAttachment = (function () {
        function CribbageResponseAttachment(text, fallback, thumb_url, image_url, color, pretext, author_name, author_link, author_icon, title, title_link, fields) {
            if (text === void 0) { text = ""; }
            if (fallback === void 0) { fallback = ""; }
            if (thumb_url === void 0) { thumb_url = ""; }
            if (image_url === void 0) { image_url = ""; }
            if (color === void 0) { color = ""; }
            if (pretext === void 0) { pretext = ""; }
            if (author_name === void 0) { author_name = ""; }
            if (author_link === void 0) { author_link = ""; }
            if (author_icon === void 0) { author_icon = ""; }
            if (title === void 0) { title = ""; }
            if (title_link === void 0) { title_link = ""; }
            if (fields === void 0) { fields = []; }
            this.text = text;
            this.fallback = fallback;
            this.thumb_url = thumb_url;
            this.image_url = image_url;
            this.color = color;
            this.pretext = pretext;
            this.author_name = author_name;
            this.author_link = author_link;
            this.author_icon = author_icon;
            this.title = title;
            this.title_link = title_link;
            this.fields = fields;
        }
        return CribbageResponseAttachment;
    })();
    var CribbageResponseData = (function () {
        function CribbageResponseData(response_type, text, attachments, unfurl_media) {
            if (response_type === void 0) { response_type = SlackResponseType.ephemeral; }
            if (text === void 0) { text = ""; }
            if (attachments === void 0) { attachments = []; }
            if (unfurl_media === void 0) { unfurl_media = true; }
            this.response_type = response_type;
            this.text = text;
            this.attachments = attachments;
            this.unfurl_media = unfurl_media;
        }
        return CribbageResponseData;
    })();
    CribbageRoutes.CribbageResponseData = CribbageResponseData;
    var CribbageResponse = (function () {
        function CribbageResponse(status, data) {
            this.status = status;
            this.data = data;
        }
        return CribbageResponse;
    })();
    CribbageRoutes.CribbageResponse = CribbageResponse;
    var Tokens;
    (function (Tokens) {
        Tokens[Tokens["joinGame"] = "WMYyNOpoJRM4dbNBp6x9yOqP"] = "joinGame";
        Tokens[Tokens["describe"] = "IA5AtVdbkur2aIGw1B549SgD"] = "describe";
        Tokens[Tokens["resetGame"] = "43LROOjSf8qa3KPYXvmxgdt1"] = "resetGame";
        Tokens[Tokens["beginGame"] = "GECanrrjA8dYMlv2e4jkLQGe"] = "beginGame";
        Tokens[Tokens["showHand"] = "Xa73JDXrWDnU276yqwremEsO"] = "showHand";
        Tokens[Tokens["playCard"] = "hnlyb5m5PfRNWyGJ3VNb8nkt"] = "playCard";
        Tokens[Tokens["throwCard"] = "2tanrKih6wNcq662RFlI1jnZ"] = "throwCard";
        Tokens[Tokens["go"] = "WdOvhPaczrOv6p8snxJSwLvL"] = "go";
    })(Tokens || (Tokens = {}));
    (function (Routes) {
        Routes[Routes["joinGame"] = "/joinGame"] = "joinGame";
        Routes[Routes["beginGame"] = "/beginGame"] = "beginGame";
        Routes[Routes["resetGame"] = "/resetGame"] = "resetGame";
        Routes[Routes["describe"] = "/describe"] = "describe";
        Routes[Routes["showHand"] = "/showHand"] = "showHand";
        Routes[Routes["playCard"] = "/playCard"] = "playCard";
        Routes[Routes["throwCard"] = "/throw"] = "throwCard";
        Routes[Routes["go"] = "/go"] = "go";
    })(CribbageRoutes.Routes || (CribbageRoutes.Routes = {}));
    var Routes = CribbageRoutes.Routes;
    function removeSpaces(str) {
        return str.replace(/\s+/g, "");
    }
    function getCardImageUrl(card, deckType) {
        if (deckType === void 0) { deckType = "Default"; }
        var cardUrlStr = card.toUrlString(".png");
        var ret = "" + process.env.AWS_S3_STANDARD_DECK_URL + deckType + "/" + cardUrlStr;
        console.log(ret);
        return ret;
    }
    var Router = (function () {
        function Router() {
        }
        Router.getPlayerHandAttachments = function (hand) {
            var attachments = [];
            hand.sortCards();
            for (var ix = 0; ix < hand.size(); ix++) {
                var card = hand.itemAt(ix);
                attachments.push(new CribbageResponseAttachment("", card.toString(), getCardImageUrl(card)));
            }
            return attachments;
        };
        Router.getPlayerHandImages = function (hand) {
            var images = "";
            hand.sortCards();
            for (var ix = 0; ix < hand.size(); ix++) {
                var card = hand.itemAt(ix);
                images += "" + getCardImageUrl(card);
                break;
            }
            return images;
        };
        Router.makeResponse = function (status, text, response_type, attachments) {
            if (status === void 0) { status = 200; }
            if (text === void 0) { text = ""; }
            if (response_type === void 0) { response_type = SlackResponseType.ephemeral; }
            if (attachments === void 0) { attachments = []; }
            return new CribbageResponse(status, new CribbageResponseData(response_type, text, attachments));
        };
        Router.sendResponse = function (response, res) {
            res.status(response.status).header("content-type", "application/json").json(response.data);
        };
        Router.sendDelayedResponse = function (responseData, url, delay) {
            if (delay === void 0) { delay = 0; }
            if (url && url.length > 0) {
                setTimeout(function () {
                    try {
                        request.post(url).json(responseData);
                    }
                    catch (e) {
                        console.log("Exception caught in sendDelayedResponse: " + e);
                    }
                }, delay);
            }
        };
        Router.getPlayerName = function (req) {
            return (req.body.user_name ? req.body.user_name : req.query.user_name ? req.query.user_name : "Unknown Player");
        };
        Router.getResponseUrl = function (req) {
            return (req.body.response_url ? req.body.response_url : "");
        };
        Router.verifyRequest = function (req, route) {
            var verified = false;
            var token = (req.body.token ? req.body.token : req.query.token ? req.query.token : null);
            switch (route) {
                case Routes.joinGame:
                    verified = (token == Tokens.joinGame);
                    break;
                case Routes.describe:
                    verified = (token == Tokens.describe);
                    break;
                case Routes.beginGame:
                    verified = (token == Tokens.beginGame);
                    break;
                case Routes.resetGame:
                    verified = (token == Tokens.resetGame);
                    break;
                case Routes.showHand:
                    verified = (token == Tokens.showHand);
                    break;
                case Routes.playCard:
                    verified = (token == Tokens.playCard);
                    break;
                case Routes.throwCard:
                    verified = (token == Tokens.throwCard);
                    break;
                case Routes.go:
                    verified = (token == Tokens.go);
                    break;
            }
            return verified;
        };
        Router.parseCards = function (text) {
            if (!text)
                throw cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
            text = removeSpaces(text);
            var textLen = text.length;
            if (textLen == 0 || textLen == 1)
                throw cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
            var cards = [];
            var ix = 0;
            while (ix < textLen) {
                var charValue = text.charAt(ix).toLowerCase(), charSuit = text.charAt(ix + 1).toLowerCase();
                var value, suit;
                switch (charValue) {
                    case 'a':
                        value = card_1.Value.Ace;
                        break;
                    case '2':
                        value = card_1.Value.Two;
                        break;
                    case '3':
                        value = card_1.Value.Three;
                        break;
                    case '4':
                        value = card_1.Value.Four;
                        break;
                    case '5':
                        value = card_1.Value.Five;
                        break;
                    case '6':
                        value = card_1.Value.Six;
                        break;
                    case '7':
                        value = card_1.Value.Seven;
                        break;
                    case '8':
                        value = card_1.Value.Eight;
                        break;
                    case '9':
                        value = card_1.Value.Nine;
                        break;
                    case '1':
                        if (charSuit != "0")
                            throw cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                        else
                            value = card_1.Value.Ten;
                        if (ix + 2 < textLen) {
                            charSuit = text.charAt(ix + 2).toLowerCase();
                            ix++;
                        }
                        break;
                    case 'j':
                        value = card_1.Value.Jack;
                        break;
                    case 'q':
                        value = card_1.Value.Queen;
                        break;
                    case 'k':
                        value = card_1.Value.King;
                        break;
                    default: throw cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                }
                switch (charSuit) {
                    case 'h':
                        suit = card_1.Suit.Hearts;
                        break;
                    case 's':
                        suit = card_1.Suit.Spades;
                        break;
                    case 'd':
                        suit = card_1.Suit.Diamonds;
                        break;
                    case 'c':
                        suit = card_1.Suit.Clubs;
                        break;
                    default: throw cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                }
                cards.push(new card_1.BaseCard(suit, value));
                ix += 2;
            }
            return cards;
        };
        Router.prototype.joinGame = function (req, res) {
            var player = Router.getPlayerName(req);
            var newPlayer = new cribbage_player_1.CribbagePlayer(player, new cribbage_hand_1.CribbageHand([]));
            var response = Router.makeResponse(200, player + " has joined the game", SlackResponseType.in_channel);
            if (this.currentGame == null) {
                this.currentGame = new cribbage_1.Cribbage(new card_game_1.Players([newPlayer]));
            }
            if (!Router.verifyRequest(req, Routes.joinGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    this.currentGame.addPlayer(newPlayer);
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
        };
        Router.prototype.beginGame = function (req, res) {
            var response = Router.makeResponse(200, cribbage_1.CribbageStrings.MessageStrings.FMT_START_GAME, SlackResponseType.in_channel);
            if (this.currentGame == null) {
                response = Router.makeResponse(500, cribbage_1.CribbageStrings.ErrorStrings.NO_GAME);
            }
            else if (this.currentGame.hasBegun) {
                response = Router.makeResponse(500, cribbage_1.CribbageStrings.ErrorStrings.HAS_BEGUN);
            }
            else if (!Router.verifyRequest(req, Routes.beginGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    this.currentGame.begin();
                    response.data.text = "" + cribbage_1.CribbageStrings.MessageStrings.FMT_START_GAME + this.currentGame.dealer.name + "'s crib.";
                    response.data.attachments.push(new CribbageResponseAttachment("Players: " + this.currentGame.printPlayers(), "", "", "good"));
                }
                catch (e) {
                    response = Router.makeResponse(500, "Cannot start the game, an error has occurred: " + e);
                }
            }
            Router.sendResponse(response, res);
        };
        Router.prototype.resetGame = function (req, res) {
            var secret = req.body.text;
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(500, "You're not allowed to reset the game, " + player + "!!", SlackResponseType.in_channel);
            var reset = false;
            if (!Router.verifyRequest(req, Routes.resetGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else if (secret != null && secret == (process.env.CRIB_RESET_SECRET || "secret")) {
                response = Router.makeResponse(200, cribbage_1.CribbageStrings.MessageStrings.GAME_RESET, SlackResponseType.ephemeral);
                this.currentGame = new cribbage_1.Cribbage(new card_game_1.Players([]));
                reset = true;
            }
            Router.sendResponse(response, res);
            if (reset) {
                response.data.response_type = SlackResponseType.in_channel;
                response.data.text = response.data.text + " by " + player;
                Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
            }
        };
        Router.prototype.describe = function (req, res) {
            var response = Router.makeResponse(200, this.currentGame ? this.currentGame.describe() : "The game is not yet initialized", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.describe)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            Router.sendResponse(response, res);
        };
        Router.prototype.showHand = function (req, res) {
            var response = Router.makeResponse(200, "");
            if (!Router.verifyRequest(req, Routes.showHand)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var hand = this.currentGame.getPlayerHand(Router.getPlayerName(req));
                    response.data.text = Router.getPlayerHandImages(hand);
                    response.data.attachments = Router.getPlayerHandAttachments(hand);
                    if (response.data.attachments.length == 0) {
                        response.data.text = "You played all your cards!";
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            console.log("Returning " + JSON.stringify(response));
            Router.sendResponse(response, res);
        };
        Router.prototype.playCard = function (req, res) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, "...", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.playCard)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    console.log("index.playCard: parsing cards");
                    var cards = Router.parseCards(req.body.text);
                    if (cards.length == 0)
                        throw cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                    else if (cards.length > 1)
                        throw cribbage_1.CribbageStrings.ErrorStrings.TOO_MANY_CARDS;
                    var card = cards[0];
                    if (card == undefined || card.suit == undefined || card.value == undefined) {
                        throw "Parsing the card failed without throwing, so I'm doing it now!";
                    }
                    console.log("index.playCard: parsed " + card.toString());
                    var cribRes = this.currentGame.playCard(player, card);
                    console.log("index.playCard: played " + card.toString());
                    var responseText = cribRes.message;
                    var cardStr = (card ? card.toString() : "(oh my, looks like something went horribly wrong)");
                    response.data.text =
                        player + " played the " + cardStr + ".\n                        The count is at " + this.currentGame.count + ".\n                        The cards in play are: " + this.currentGame.sequence.toString() + ".\n                        You're up, " + this.currentGame.nextPlayerInSequence.name + ".";
                    if (cribRes.gameOver) {
                        response.data.text = responseText;
                    }
                    else if (responseText.length > 0) {
                        if (cribRes.roundOver) {
                            response.data.text = "" + responseText;
                        }
                        else {
                            response.data.text = responseText + "\n                            " + response.data.text;
                        }
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, "Error! " + e + "! Current player: " + this.currentGame.nextPlayerInSequence.name);
                }
            }
            Router.sendResponse(response, res);
            if (response.status == 200 && !cribRes.gameOver && !cribRes.roundOver) {
                var theirHand = this.currentGame.getPlayerHand(Router.getPlayerName(req));
                var theirCards = Router.getPlayerHandAttachments(theirHand);
                var hasHand = (theirCards.length > 0);
                var delayedData = new CribbageResponseData(SlackResponseType.ephemeral);
                delayedData.text = Router.getPlayerHandImages(theirHand);
                if (!hasHand)
                    delayedData.text = "You have no more cards!";
                else
                    delayedData.attachments = theirCards;
                Router.sendDelayedResponse(delayedData, Router.getResponseUrl(req), 1000);
            }
        };
        Router.prototype.throwCard = function (req, res) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, "...");
            var cribRes = null;
            if (!Router.verifyRequest(req, Routes.throwCard)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var cards = Router.parseCards(req.body.text);
                    cribRes = this.currentGame.giveToKitty(player, new item_collection_1.ItemCollection(cards));
                    var cardsPlayed = [];
                    for (var ix = 0; ix < cards.length; ix++) {
                        cardsPlayed.push(new CribbageResponseAttachment("You threw", "", getCardImageUrl(cards[ix])));
                    }
                    if (cribRes.gameOver) {
                        response.data.text = cribRes.message;
                    }
                    else {
                        response.data.attachments = cardsPlayed;
                        var theirHand = this.currentGame.getPlayerHand(player);
                        var theirCards = Router.getPlayerHandAttachments(theirHand);
                        response.data.text = Router.getPlayerHandImages(theirHand);
                        if (theirCards.length > 0) {
                            response.data.attachments = cardsPlayed.concat(theirCards);
                        }
                        else {
                            response.data.text = "You have no more cards left";
                        }
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
            if (response.status == 200 && !cribRes.gameOver) {
                if (cribRes.message.length > 0)
                    response.data.text = "" + cribRes.message;
                response.data.text += "\n                " + player + " threw to the kitty";
                response.data.response_type = SlackResponseType.in_channel;
                Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
                if (this.currentGame.isReady()) {
                    Router.sendDelayedResponse(new CribbageResponseData(SlackResponseType.in_channel, "The game is ready to begin.\n                            Play a card " + this.currentGame.nextPlayerInSequence.name + ".", [new CribbageResponseAttachment("Card Card", "", getCardImageUrl(this.currentGame.cut))]), Router.getResponseUrl(req), 1000);
                }
            }
        };
        Router.prototype.go = function (req, res) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, player + " says \"go\"", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.go)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var cribResponse = this.currentGame.go(player);
                    if (cribResponse.gameOver) {
                        response.data.text = cribResponse.message;
                    }
                    else if (cribResponse.message.length > 0) {
                        response.data.text += "\n                        " + cribResponse.message;
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
        };
        Router.VALIDATION_FAILED_RESPONSE = new CribbageResponse(500, new CribbageResponseData(SlackResponseType.ephemeral, "Token validation failed"));
        return Router;
    })();
    CribbageRoutes.Router = Router;
})(CribbageRoutes = exports.CribbageRoutes || (exports.CribbageRoutes = {}));
//# sourceMappingURL=index.js.map