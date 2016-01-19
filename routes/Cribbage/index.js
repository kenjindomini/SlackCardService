var cribbage_player_1 = require("../../card_service/implementations/cribbage_player");
var cribbage_1 = require("../../card_service/implementations/cribbage");
var cribbage_hand_1 = require("../../card_service/implementations/cribbage_hand");
var card_game_1 = require("../../card_service/base_classes/card_game");
var card_1 = require("../../card_service/base_classes/items/card");
var request = require("request");
var CribbageStrings;
(function (CribbageStrings) {
    var MessageStrings = (function () {
        function MessageStrings() {
        }
        Object.defineProperty(MessageStrings, "START_GAME", {
            get: function () { return "The game is afoot, throw your cards to the crib."; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MessageStrings, "GAME_RESET", {
            get: function () { return "The game was reset"; },
            enumerable: true,
            configurable: true
        });
        return MessageStrings;
    })();
    CribbageStrings.MessageStrings = MessageStrings;
    var ErrorStrings = (function () {
        function ErrorStrings() {
        }
        Object.defineProperty(ErrorStrings, "NO_GAME", {
            get: function () { return "The game hasn't been created. Add some players first."; },
            enumerable: true,
            configurable: true
        });
        return ErrorStrings;
    })();
    CribbageStrings.ErrorStrings = ErrorStrings;
})(CribbageStrings = exports.CribbageStrings || (exports.CribbageStrings = {}));
function removeLastTwoChars(str) {
    var ret = "";
    var len = str.length;
    if (len == 1) {
        ret = str.substring(0);
    }
    else if (len > 1) {
        ret = str.substring(0, len - 2);
    }
    return ret;
}
exports.removeLastTwoChars = removeLastTwoChars;
var CribbageRoutes;
(function (CribbageRoutes) {
    var SlackResponseType;
    (function (SlackResponseType) {
        SlackResponseType[SlackResponseType["ephemeral"] = "ephemeral"] = "ephemeral";
        SlackResponseType[SlackResponseType["in_channel"] = "in_channel"] = "in_channel";
    })(SlackResponseType || (SlackResponseType = {}));
    var CribbageResponseData = (function () {
        function CribbageResponseData(response_type, text, attachments) {
            if (response_type === void 0) { response_type = SlackResponseType.ephemeral; }
            if (text === void 0) { text = ""; }
            if (attachments === void 0) { attachments = []; }
            this.response_type = response_type;
            this.text = text;
            this.attachments = attachments;
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
    })(Tokens || (Tokens = {}));
    (function (Routes) {
        Routes[Routes["joinGame"] = "/joinGame"] = "joinGame";
        Routes[Routes["beginGame"] = "/beginGame"] = "beginGame";
        Routes[Routes["resetGame"] = "/resetGame"] = "resetGame";
        Routes[Routes["describe"] = "/describe"] = "describe";
    })(CribbageRoutes.Routes || (CribbageRoutes.Routes = {}));
    var Routes = CribbageRoutes.Routes;
    var Router = (function () {
        function Router() {
        }
        Router.makeResponse = function (status, text, response_type, attachments) {
            if (status === void 0) { status = 200; }
            if (text === void 0) { text = ""; }
            if (response_type === void 0) { response_type = SlackResponseType.ephemeral; }
            if (attachments === void 0) { attachments = []; }
            return new CribbageResponse(status, new CribbageResponseData(response_type, text, attachments));
        };
        Router.sendResponse = function (response, res) {
            res.status(response.status).header("content-type", "application/json").send(JSON.stringify(response.data));
        };
        Router.sendDelayedResponse = function (responseData, url) {
            request.post(url, { json: responseData }, function (error, response, body) {
                console.log("Done with the delayed response: error: " + error + ", response: " + JSON.stringify(response) + ". body: " + body);
            });
        };
        Router.getPlayerName = function (req) {
            return (req.body.user_name ? req.body.user_name : "Unknown Player");
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
            }
            return verified;
        };
        Router.prototype.joinGame = function (req, res) {
            var playerName = Router.getPlayerName(req);
            var newPlayer = new cribbage_player_1.CribbagePlayer(playerName, new cribbage_hand_1.CribbageHand([]));
            var response = Router.makeResponse(200, playerName + " has joined the game", SlackResponseType.in_channel);
            if (this.currentGame == null) {
                this.currentGame = new cribbage_1.Cribbage(new card_game_1.Players([newPlayer]));
            }
            else if (!Router.verifyRequest(req, Routes.joinGame)) {
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
            var response = Router.makeResponse(200, CribbageStrings.MessageStrings.START_GAME, SlackResponseType.in_channel);
            if (this.currentGame == null) {
                response = Router.makeResponse(500, CribbageStrings.ErrorStrings.NO_GAME);
            }
            else if (!Router.verifyRequest(req, Routes.beginGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    this.currentGame.begin();
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
            else if (secret != null && secret == "secret") {
                response = Router.makeResponse(200, CribbageStrings.MessageStrings.GAME_RESET, SlackResponseType.ephemeral);
                this.currentGame = new cribbage_1.Cribbage(new card_game_1.Players([]));
                reset = true;
            }
            Router.sendResponse(response, res);
            if (reset) {
                response.data.response_type = SlackResponseType.in_channel;
                setTimeout(function () {
                    Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
                }, 1000);
            }
        };
        Router.prototype.describe = function (req, res) {
            var response = Router.makeResponse(200, this.currentGame ? this.currentGame.describe() : "The game is not yet initialized", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.describe)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            Router.sendResponse(response, res);
        };
        Router.prototype.showCards = function (req, res) {
            var response = Router.makeResponse(200, "...");
            try {
                response.data.text = this.currentGame.getPlayerHand(Router.getPlayerName(req));
            }
            catch (e) {
                response = Router.makeResponse(400, e);
            }
            Router.sendResponse(response, res);
        };
        Router.prototype.playCard = function (req, res) {
            var player = Router.getPlayerName(req);
            var card = new card_1.BaseCard(req.body.suit, req.body.value);
            var response = Router.makeResponse(200, player + " played " + card.toString() + ". You're up, " + this.currentGame.nextPlayerInSequence.name + ".");
            try {
                var gameOver = this.currentGame.playCard(player, card);
                if (gameOver) {
                    var winners = "";
                    for (var ix = 0; ix < this.currentGame.players.countItems(); ix++) {
                        winners += (this.currentGame.players.itemAt(ix).name + ", ");
                    }
                    winners = removeLastTwoChars(winners);
                    response.data.text = "Game over. Winners: " + winners;
                }
            }
            catch (e) {
                response = Router.makeResponse(400, "Error! " + e + "! Current player: " + this.currentGame.nextPlayerInSequence);
            }
            Router.sendResponse(response, res);
        };
        Router.VALIDATION_FAILED_RESPONSE = new CribbageResponse(500, new CribbageResponseData(SlackResponseType.ephemeral, "Token validation failed"));
        return Router;
    })();
    CribbageRoutes.Router = Router;
})(CribbageRoutes = exports.CribbageRoutes || (exports.CribbageRoutes = {}));
//# sourceMappingURL=index.js.map