/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../card_service/implementations/cribbage.ts" />
/// <reference path="../../card_service/implementations/cribbage_hand.ts" />
/// <reference path="../../card_service/implementations/cribbage_player.ts" />
/// <reference path="../../card_service/base_classes/card_game.ts" />

import request = require("request");

import {Request, Response} from "express";
import {CribbagePlayer} from "../../card_service/implementations/cribbage_player";
import {Cribbage, CribbageStrings, CribbageReturn} from "../../card_service/implementations/cribbage";
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";
import {Players, Teams} from "../../card_service/base_classes/card_game";
import {BaseCard as Card, Value, Suit} from "../../card_service/base_classes/items/card";
import {ItemCollection} from "../../card_service/base_classes/collections/item_collection";
import {removeLastTwoChars} from "../../card_service/base_classes/card_game";
import {ImageConvert} from "./image_convert";

export module CribbageRoutes {

    enum SlackResponseType {
        /* message sent to the user */
        ephemeral = <any>"ephemeral",

        /* message sent to the channel */
        in_channel = <any>"in_channel"
    }

    class CribbageAttachmentField {
        constructor(
            public title: string = "", // Shown as a bold heading above the value text. It cannot contain markup and will be escaped for you.
            public value: string = "", // The text value of the field. It may contain standard message markup and must be escaped as normal. May be multi-line.
            public short: string ="" // An optional flag indicating whether the value is short enough to be displayed side-by-side with other values.
        ){
        }
    }
    /**
     * https://api.slack.com/docs/attachments
     */
    class CribbageResponseAttachment {
        constructor(
            public text: string = "", // This is the main text in a message attachment, and can contain standard message markup
            public fallback: string = "", // Required plain-text summary of the attachment
            public image_url: string = "", // A valid URL to an image file that will be displayed inside a message attachment. We currently support the following formats: GIF, JPEG, PNG, and BMP.
            public thumb_url: string = "", // A valid URL to an image file that will be displayed as a thumbnail on the right side of a message attachment. We currently support the following formats: GIF, JPEG, PNG, and BMP.
            public color: string = "", // An optional value that can either be one of good, warning, danger, or any hex color code
            public pretext: string = "", // Optional text that appears above the attachment block
            public author_name: string = "", // Small text used to display the author's name.
            public author_link: string = "", // A valid URL that will hyperlink the author_name text mentioned above. Will only work if author_name is present.
            public author_icon: string = "", // A valid URL that displays a small 16x16px image to the left of the author_name text. Will only work if author_name is present.
            public title: string = "", // The title is displayed as larger, bold text near the top of a message attachment
            public title_link: string = "", // By passing a valid URL in the title_link parameter (optional), the title text will be hyperlinked.
            public fields: Array<CribbageAttachmentField> = [] // Fields are defined as an array, and hashes contained within it will be displayed in a table inside the message attachment.
        ){
        }
    }

    export class CribbageResponseData {
        constructor(
            public response_type: SlackResponseType = SlackResponseType.ephemeral,
            public text: string = "",
            public attachments: Array<CribbageResponseAttachment> = []
        ) {
        }
    }

    export class CribbageResponse {
        constructor(public status:number, public data:CribbageResponseData) {
        }
    }

    // SB TODO: refactor into an env file
    enum Tokens {
        joinGame = <any>"WMYyNOpoJRM4dbNBp6x9yOqP",
        describe = <any>"IA5AtVdbkur2aIGw1B549SgD",
        resetGame = <any>"43LROOjSf8qa3KPYXvmxgdt1",
        beginGame = <any>"GECanrrjA8dYMlv2e4jkLQGe",
        showHand = <any>"Xa73JDXrWDnU276yqwremEsO",
        playCard = <any>"hnlyb5m5PfRNWyGJ3VNb8nkt",
        throwCard = <any>"2tanrKih6wNcq662RFlI1jnZ",
        go = <any>"WdOvhPaczrOv6p8snxJSwLvL"
    }

    export enum Routes {
        joinGame = <any>"/joinGame",
        beginGame = <any>"/beginGame",
        resetGame = <any>"/resetGame",
        describe = <any>"/describe",
        showHand = <any>"/showHand",
        playCard = <any>"/playCard",
        throwCard = <any>"/throw",
        go = <any>"/go"
    }

    function removeSpaces(str:string):string {
        return str.replace(/\s+/g, "");
    }

    export class Router {

        currentGame:Cribbage;
        static VALIDATION_FAILED_RESPONSE: CribbageResponse =
            new CribbageResponse(500,
                new CribbageResponseData(SlackResponseType.ephemeral, "Token validation failed")
            );

        /* ***** Helper Methods ***** */

        private static makeResponse(
            status:number=200,
            text:string="",
            response_type:SlackResponseType=SlackResponseType.ephemeral,
            attachments:Array<CribbageResponseAttachment>=[]
        ): CribbageResponse {
            return new CribbageResponse(status, new CribbageResponseData(response_type, text, attachments));
        }

        private static sendResponse(response:CribbageResponse, res:Response):void {
            res.status(response.status).header("content-type", "application/json").json(response.data);
        }

        private static sendDelayedResponse(responseData:CribbageResponseData, url:string, delay:number=0):void {
            if (url && url.length > 0) {
                setTimeout(() => {
                    try {
                        request.post(url).json(responseData);
                    }
                    catch (e) {
                        console.log(`Exception caught in sendDelayedResponse: ${e}`);
                    }
                }, delay);
            }
        }

        private static getPlayerName(req:Request):string {
            return (req.body.user_name ? req.body.user_name : req.query.user_name ? req.query.user_name : "Unknown Player");
        }

        private static getResponseUrl(req:Request):string {
            return (req.body.response_url ? req.body.response_url : req.query.response_url ? req.query.response_url : "");
        }

        /**
         * Use the token sent across in the request to verify the request
         * @param req {Request}
         * @param route
         * @returns {boolean}
         * SB TODO: Refactor into middleware
         */
        private static verifyRequest(req:Request, route:Routes):boolean {
            var verified = false;
            var token = (req.body.token ? req.body.token : req.query.token ? req.query.token : null);
            switch (route) {
                case Routes.joinGame: verified = (token == Tokens.joinGame); break;
                case Routes.describe: verified = (token == Tokens.describe); break;
                case Routes.beginGame: verified = (token == Tokens.beginGame); break;
                case Routes.resetGame: verified = (token == Tokens.resetGame); break;
                case Routes.showHand: verified = (token == Tokens.showHand); break;
                case Routes.playCard: verified = (token == Tokens.playCard); break;
                case Routes.throwCard: verified = (token == Tokens.throwCard); break;
                case Routes.go: verified = (token == Tokens.go); break;
            }
            return verified;
        }

        /**
         * Parse the cards out of the request
         * @param text the text from the request
         * @returns {BaseCard} the parsed card
         * @throws CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX if parsing fails
         */
        static parseCards(text: string):Array<Card> {
            if (!text)
                throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
            // Strip out all the spaces
            text = removeSpaces(text);
            var textLen = text.length;
            if (textLen == 0 || textLen == 1)
                throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
            var cards = [];
            var ix = 0;
            while (ix < textLen) {
                var charValue = text.charAt(ix).toLowerCase(), charSuit = text.charAt(ix+1).toLowerCase();
                var value: Value, suit: Suit;
                switch (charValue) {
                    case 'a': value = Value.Ace; break;
                    case '2': value = Value.Two; break;
                    case '3': value = Value.Three; break;
                    case '4': value = Value.Four; break;
                    case '5': value = Value.Five; break;
                    case '6': value = Value.Six; break;
                    case '7': value = Value.Seven; break;
                    case '8': value = Value.Eight; break;
                    case '9': value = Value.Nine; break;
                    case '1':
                        if (charSuit != "0")
                            throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                        else
                            value = Value.Ten;
                        // set the suit character to the next character
                        if (ix + 2 < textLen) {
                            charSuit = text.charAt(ix+2).toLowerCase();
                            ix++;
                        }
                        break;
                    case 'j': value = Value.Jack; break;
                    case 'q': value = Value.Queen; break;
                    case 'k': value = Value.King; break;
                    default: throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                }
                switch (charSuit) {
                    case 'h': suit = Suit.Hearts; break;
                    case 's': suit = Suit.Spades; break;
                    case 'd': suit = Suit.Diamonds; break;
                    case 'c': suit = Suit.Clubs; break;
                    default: throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                }
                cards.push(new Card(suit, value));
                ix += 2;
            }
            return cards;
        }

        private static sendPlayerHand(player:string, hand:CribbageHand, response:CribbageResponse, req:Request):void {
            ImageConvert.makeHandImage(hand, player, process.env.TMP_CARDS_PATH)
                .done(function(handPath:string) {
                    var imagePath = `${process.env.APP_HOST_URL}/${handPath}`;
                    response.data.attachments = [new CribbageResponseAttachment("", "", imagePath)];
                    if (response.data.attachments.length == 0) {
                        response.data.text = "You played all your cards!";
                    }
                    else {
                        response.data.text = "";
                    }
                    console.log(`Returning ${JSON.stringify(response)}`);
                    Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
                });
        }

        /**
         * NOTE:
         * A new Game should be created by players joining the game via "joinGame",
         * then calling "beginGame" when all have joined
         */

        /* ***** ROUTES ***** */

        /* ***** Initializing the Game ***** */

        joinGame(req:Request, res:Response) {
            var player = Router.getPlayerName(req);
            var newPlayer = new CribbagePlayer(player, new CribbageHand([]));
            var response = Router.makeResponse(200, `${player} has joined the game`, SlackResponseType.in_channel);
            if (this.currentGame == null) {
                this.currentGame = new Cribbage(new Players([newPlayer]))
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
        }

        beginGame(req:Request, res:Response) {
            var response = Router.makeResponse(200, CribbageStrings.MessageStrings.FMT_START_GAME, SlackResponseType.in_channel);
            if (this.currentGame == null) {
                response = Router.makeResponse(500, CribbageStrings.ErrorStrings.NO_GAME);
            }
            else if (this.currentGame.hasBegun) {
                response = Router.makeResponse(500, CribbageStrings.ErrorStrings.HAS_BEGUN);
            }
            else if (!Router.verifyRequest(req, Routes.beginGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    this.currentGame.begin();
                    response.data.text = `${CribbageStrings.MessageStrings.FMT_START_GAME}${this.currentGame.dealer.name}'s crib.`;
                    response.data.attachments.push(
                        new CribbageResponseAttachment(`Players: ${this.currentGame.printPlayers()}`, "", "", "good")
                    );
                }
                catch (e) {
                    // SB TODO: Elaborate on what went wrong
                    response = Router.makeResponse(500, `Cannot start the game, an error has occurred: ${e}`);
                }
            }
            Router.sendResponse(response, res);
        }

        resetGame(req:Request, res:Response) {
            var secret = req.body.text;
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(500, `You're not allowed to reset the game, ${player}!!`, SlackResponseType.in_channel);
            var reset = false;
            if (!Router.verifyRequest(req, Routes.resetGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else if (secret != null && secret == (process.env.CRIB_RESET_SECRET || "secret")) {
                // Allow the game to be reset
                response = Router.makeResponse(200, CribbageStrings.MessageStrings.GAME_RESET, SlackResponseType.ephemeral);
                this.currentGame = new Cribbage(new Players<CribbagePlayer>([]));
                reset = true;
            }
            Router.sendResponse(response, res);
            if (reset) {
                response.data.response_type = SlackResponseType.in_channel;
                response.data.text = `${response.data.text} by ${player}`;
                Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
            }
        }


        /* ***** Run of play ***** */

        describe(req:Request, res:Response) {
            var response = Router.makeResponse(200, this.currentGame ? this.currentGame.describe() : "The game is not yet initialized", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.describe)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            Router.sendResponse(response, res);
        }

        showHand(req:Request, res:Response) {
            var response = Router.makeResponse(200, "creating your hand's image...");
            if (!Router.verifyRequest(req, Routes.showHand)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var player = Router.getPlayerName(req);
                    var hand:CribbageHand = this.currentGame.getPlayerHand(player);
                    Router.sendPlayerHand(player, hand, response, req);
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
        }

        playCard(req:Request, res:Response) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, "...", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.playCard)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var cards:Array<Card> = Router.parseCards(req.body.text);
                    if (cards.length == 0)
                        throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
                    else if (cards.length > 1)
                        throw CribbageStrings.ErrorStrings.TOO_MANY_CARDS;
                    var card = cards[0];
                    if (card == undefined || card.suit == undefined || card.value == undefined) {
                        throw "Parsing the card failed without throwing, so I'm doing it now!";
                    }
                    var cribRes = this.currentGame.playCard(player, card);
                    var responseText = cribRes.message;
                    let justPlayed = `${player} played the ${card.toString()}.`;
                    let currentCount = `The count is at ${this.currentGame.count}.`;
                    let cardsInPlay = this.currentGame.sequence.length() > 0 ?
                        `The cards in play are: ${this.currentGame.sequence.toString()}.` :
                        `There are no cards currently in play.`;
                    let nextPlayer = `You're up, ${this.currentGame.nextPlayerInSequence.name}.`;
                    response.data.text =
                        `${ justPlayed }
                        ${ currentCount }
                        ${ cardsInPlay }
                        ${ nextPlayer }`;
                    if (cribRes.gameOver) {
                        response.data.text = responseText;
                    }
                    else if (responseText.length > 0) {
                        if (cribRes.roundOver) {
                            // The round is over, use the responseText string
                            response.data.text = `${responseText}`;
                        }
                        else {
                            // Prepend cribbage game's response
                            response.data.text = `${responseText}
                            ${response.data.text}`;
                        }
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, `Error! ${e}! Current player: ${this.currentGame.nextPlayerInSequence.name}`);
                }
            }
            Router.sendResponse(response, res);
            if (response.status == 200 && !cribRes.gameOver && !cribRes.roundOver) {
                // Tell the player what cards they have
                var theirHand:CribbageHand = this.currentGame.getPlayerHand(Router.getPlayerName(req));
                var hasHand = (theirHand.size() > 0);
                var delayedData = new CribbageResponseData(SlackResponseType.ephemeral);
                if (!hasHand)
                     delayedData.text = "You have no more cards!";
                else {
                    ImageConvert.makeHandImage(theirHand, player, process.env.TMP_CARDS_PATH)
                        .done(function(handPath:string) {
                            delayedData.attachments = [new CribbageResponseAttachment("", "", handPath)];
                            Router.sendDelayedResponse(
                                delayedData,
                                Router.getResponseUrl(req),
                                1000
                            );
                        });
                }
            }
        }

        throwCard(req:Request, res:Response) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, "...");
            var cribRes:CribbageReturn = null;
            var delayed = false;
            if (!Router.verifyRequest(req, Routes.throwCard)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var cards:Array<Card> = Router.parseCards(req.body.text);
                    cribRes = this.currentGame.giveToKitty(player, new ItemCollection(cards));
                    //var cardsPlayed:Array<CribbageResponseAttachment> = [];
                    //for (var ix = 0; ix < cards.length; ix++) {
                    //    cardsPlayed.push(new CribbageResponseAttachment("You threw", "", getCardImageUrl(cards[ix])));
                    //}
                    if (cribRes.gameOver) {
                        response.data.text = cribRes.message;
                    }
                    else {
                        // Show the card they just played
                        //response.data.attachments = cardsPlayed;
                        // Show the rest of their hand
                        var theirHand = this.currentGame.getPlayerHand(player);
                        if (theirHand.size() > 0) {
                            delayed = true;
                            ImageConvert.makeHandImage(theirHand, player, process.env.TMP_CARDS_PATH)
                                .done(function (handPath:string) {
                                    response.data.attachments = [new CribbageResponseAttachment("", "", handPath)];
                                    Router.sendResponse(response, res);
                                });
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
            if (!delayed) {
                Router.sendResponse(response, res);
            }
            if (response.status == 200 && !cribRes.gameOver) {
                if (cribRes.message.length > 0)
                    response.data.text = `${cribRes.message}`;
                response.data.text += `
                ${player} threw to the kitty`;
                response.data.response_type = SlackResponseType.in_channel;
                Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
                if (this.currentGame.isReady()) {
                    // Let the players know it's time to begin the game
                    Router.sendDelayedResponse(
                        new CribbageResponseData(
                            SlackResponseType.in_channel,
                            `The game is ready to begin.
                            Play a card ${this.currentGame.nextPlayerInSequence.name}.`,
                            [new CribbageResponseAttachment("Card Card", "", ImageConvert.getCardImageUrl(this.currentGame.cut))]
                        ),
                        Router.getResponseUrl(req),
                        1000
                    );
                }
            }
        }

        go(req:Request, res:Response) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, `${player} says "go"`, SlackResponseType.in_channel);
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
                        response.data.text += `
                        ${cribResponse.message}`;
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
        }
    }
}