/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../card_service/implementations/cribbage.ts" />
/// <reference path="../../card_service/implementations/cribbage_hand.ts" />
/// <reference path="../../card_service/implementations/cribbage_player.ts" />
/// <reference path="../../card_service/base_classes/card_game.ts" />

import {Request, Response} from "express";
import {CribbagePlayer} from "../../card_service/implementations/cribbage_player";
import {Cribbage} from "../../card_service/implementations/cribbage";
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";
import {Players, Teams} from "../../card_service/base_classes/card_game";
import {BaseCard as Card, Value, Suit} from "../../card_service/base_classes/items/card";
import {ItemCollection} from "../../card_service/base_classes/collections/item_collection";
import {removeLastTwoChars} from "../../card_service/base_classes/card_game";
import MessageStrings = CribbageStrings.MessageStrings;

var request = require("request");

// Generic messages
export module CribbageStrings {
    export class MessageStrings {
        static get START_GAME():string { return "The game is afoot, throw your cards to the crib."; }
        static get GAME_RESET():string { return "The game was reset"; }
    }
    export class ErrorStrings {
        static get NO_GAME():string { return "The game hasn't been created. Add some players first."; }
        static get INVALID_CARD_SYNTAX():string {
            return "Invalid syntax. Enter your card as (value)(suit), for example enter the five of hearts as 5H.";
        }
    }
}

export module CribbageRoutes {

    enum SlackResponseType {
        /* message sent to the user */
        ephemeral = <any>"ephemeral",

        /* message sent to the channel */
        in_channel = <any>"in_channel"
    }

    export class CribbageResponseData {
        constructor(
            public response_type: SlackResponseType = SlackResponseType.ephemeral,
            public text: string = "",
            public attachments: Array<string> = []
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
            attachments:Array<string>=[]
        ): CribbageResponse {
            return new CribbageResponse(status, new CribbageResponseData(response_type, text, attachments));
        }

        private static sendResponse(response:CribbageResponse, res:Response):void {
            res.status(response.status).header("content-type", "application/json").json(response.data);
        }

        private static sendDelayedResponse(responseData:CribbageResponseData, url:string):void {
            try {
                request.post(url).json(responseData);
            }
            catch (e) {
                console.log(`Exception caught in sendDelayedResponse: ${e}`);
            }
        }

        private static getPlayerName(req:Request):string {
            return (req.body.user_name ? req.body.user_name : req.query.user_name ? req.query.user_name : "Unknown Player");
        }

        private static getResponseUrl(req:Request):string {
            return (req.body.response_url ? req.body.response_url : "");
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
            text = text.replace(/\s+/g, "");
            var textLen = text.length;
            if (textLen == 0 || textLen == 1)
                throw CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX;
            var cards = [];
            var ix = 0;
            while (ix < textLen) {
                var charValue = text[ix].toLowerCase(), charSuit = text[ix+1].toLowerCase();
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
                            charSuit = text[ix+2].toLowerCase();
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
        }

        beginGame(req:Request, res:Response) {
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
                    response.data.attachments.push(`${this.currentGame.describe()}`);
                }
                catch (e) {
                    // SB TODO: Elaborate on what went wrong
                    response = Router.makeResponse(500, `Cannot start the game, an error has occurred: ${e}`);
                }
            }
            Router.sendResponse(response, res);
        }

        resetGame(req:Request, res:Response) {
            // SB TODO: Have a better way to have a secret on the server so that trolls can't keep resetting the game
            var secret = req.body.text;
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(500, `You're not allowed to reset the game, ${player}!!`, SlackResponseType.in_channel);
            var reset = false;
            if (!Router.verifyRequest(req, Routes.resetGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else if (secret != null && secret == "secret") {
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
            var response = Router.makeResponse(200, "...");
            if (!Router.verifyRequest(req, Routes.showHand)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    response.data.text = this.currentGame.getPlayerHand(Router.getPlayerName(req));
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
                    var card = cards[0];
                    var gameOver:boolean = this.currentGame.playCard(player, card);
                    response.data.text =
                        `${player} played the ${card.toString()}.
                    The count is at ${this.currentGame.count}.
                    The cards in play are: ${this.currentGame.sequence.toString()}.
                    You're up, ${this.currentGame.nextPlayerInSequence.name}.`;
                    if (gameOver) {
                        var winners = "";
                        for (var ix = 0; ix < this.currentGame.players.countItems(); ix++) {
                            winners += (this.currentGame.players.itemAt(ix).name + ", ");
                        }
                        // Remove last two chars
                        winners = removeLastTwoChars(winners);
                        response.data.text = `Game over. Winners: ${winners}`;
                    }
                }
                catch (e) {
                    response = Router.makeResponse(500, `Error! ${e}! Current player: ${this.currentGame.nextPlayerInSequence.name}`);
                }
            }
            Router.sendResponse(response, res);
        }

        throwCard(req:Request, res:Response) {
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(200, "...");
            if (!Router.verifyRequest(req, Routes.throwCard)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else {
                try {
                    var cards:Array<Card> = Router.parseCards(req.body.text);
                    this.currentGame.giveToKitty(player, new ItemCollection(cards));
                    var played = "";
                    for (var ix = 0; ix < cards.length; ix++) {
                        played += `${cards[ix].toString()}, `;
                    }
                    played = removeLastTwoChars(played);
                    response.data.text = `You threw ${played}. Your cards are ${this.currentGame.getPlayerHand(player)}`;
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
            if (response.status == 200) {
                response.data.text = `${player} threw to the kitty`;
                response.data.response_type = SlackResponseType.in_channel;
                Router.sendDelayedResponse(response.data, Router.getResponseUrl(req));
                if (this.currentGame.isReady()) {
                    setTimeout(function() {
                        // Let the players know it's time to begin the game
                        Router.sendDelayedResponse(
                            new CribbageResponseData(
                                SlackResponseType.in_channel,
                                `The game is ready to begin. Play a card ${this.currentGame.nextPlayerInSequence.name}.`
                            ),
                            Router.getResponseUrl(req)
                        );
                    }, 1000);
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
                    this.currentGame.go(player);
                }
                catch (e) {
                    response = Router.makeResponse(500, e);
                }
            }
            Router.sendResponse(response, res);
        }
    }
}