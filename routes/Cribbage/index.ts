/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../card_service/implementations/cribbage.ts" />
/// <reference path="../../card_service/implementations/cribbage_hand.ts" />
/// <reference path="../../card_service/implementations/cribbage_player.ts" />
/// <reference path="../../card_service/base_classes/card_game.ts" />

import * as express from "express";

import {CribbagePlayer} from "../../card_service/implementations/cribbage_player";
import {Cribbage} from "../../card_service/implementations/cribbage";
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";
import {Players, Teams} from "../../card_service/base_classes/card_game";
import {BaseCard as Card} from "../../card_service/base_classes/items/card";

export module CribbageStrings {
    export class MessageStrings {
        static get START_GAME():string { return "The game is afoot, throw your cards to the crib."; }
        static get GAME_RESET():string { return "The game was reset"; }
    }
    export class ErrorStrings {
        static get NO_GAME():string { return "The game hasn't been created. Add some players first."; }
    }
}

export function removeLastTwoChars(str:string): string {
    var ret = "";
    var len = str.length;
    if (len == 1) {
        ret = str.substring(0);
    }
    else if (len > 1) {
        ret = str.substring(0, len - 2)
    }
    return ret;
}

export module CribbageRoutes {

    enum SlackResponseType {
        ephemeral = <any>"ephemeral", /* message sent to the user */
        in_channel = <any>"in_channel" /* message sent to the channel */
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

    enum Tokens {
        joinGame = <any>"WMYyNOpoJRM4dbNBp6x9yOqP",
        describe = <any>"IA5AtVdbkur2aIGw1B549SgD",
        resetGame = <any>"43LROOjSf8qa3KPYXvmxgdt1",
        beginGame = <any>"GECanrrjA8dYMlv2e4jkLQGe"
    }

    export enum Routes {
        joinGame= <any>"/joinGame",
        beginGame= <any>"/beginGame",
        resetGame= <any>"/resetGame",
        describe= <any>"/describe"
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

        private static sendResponse(response:CribbageResponse, res:express.Response):void {
            res.status(response.status).header("content-type", "application/json").send(JSON.stringify(response.data));
        }

        private static sendDelayedResponse(response:CribbageResponse, url:string):void {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xhr.send(JSON.stringify(response));
        }

        private static getPlayerName(req:express.Request):string {
            return (req.body.user_name ? req.body.user_name : "Unknown Player");
        }

        private static getResponseUrl(req:express.Request):string {
            return (req.body.response_url ? req.body.response_url : "");
        }

        private static verifyRequest(req:express.Request, route:Routes):boolean {
            var verified = false;
            var token = (req.body.token ? req.body.token : req.query.token ? req.query.token : null);
            switch (route) {
                case Routes.joinGame: verified = (token == Tokens.joinGame); break;
                case Routes.describe: verified = (token == Tokens.describe); break;
                case Routes.beginGame: verified = (token == Tokens.beginGame); break;
                case Routes.resetGame: verified = (token == Tokens.resetGame); break;
            }
            return verified;
        }

        /**
         * NOTE:
         * A new Game should be created by players joining the game via "joinGame",
         * then calling "beginGame" when all have joined
         */

        /* ***** ROUTES ***** */

        /* ***** Initializing the Game ***** */

        joinGame(req:express.Request, res:express.Response) {
            var playerName = Router.getPlayerName(req);
            var newPlayer = new CribbagePlayer(playerName, new CribbageHand([]));
            var response = Router.makeResponse(200, `${playerName} has joined the game`, SlackResponseType.in_channel);
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

        beginGame(req:express.Request, res:express.Response) {
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
                    // SB TODO: Elaborate on what went wrong
                    response = Router.makeResponse(500, `Cannot start the game, an error has occurred: ${e}`);
                }
            }
            Router.sendResponse(response, res);
        }

        resetGame(req:express.Request, res:express.Response) {
            // SB TODO: Have a better way to have a secret on the server so that trolls can't keep resetting the game
            var secret = req.body.text;
            var player = Router.getPlayerName(req);
            var response = Router.makeResponse(500, `You're not allowed to reset the game, ${player}!!`, SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.resetGame)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            else if (secret != null && secret == "secret") {
                // Allow the game to be reset
                response = Router.makeResponse(200, CribbageStrings.MessageStrings.GAME_RESET, SlackResponseType.ephemeral);
                this.currentGame = new Cribbage(new Players<CribbagePlayer>([]));
            }
            Router.sendResponse(response, res);
            response.data.response_type = SlackResponseType.in_channel;
            Router.sendDelayedResponse(response, Router.getResponseUrl(req));
        }


        /* ***** Run of play ***** */

        describe(req:express.Request, res:express.Response) {
            var response = Router.makeResponse(200, this.currentGame ? this.currentGame.describe() : "The game is not yet initialized", SlackResponseType.in_channel);
            if (!Router.verifyRequest(req, Routes.describe)) {
                response = Router.VALIDATION_FAILED_RESPONSE;
            }
            Router.sendResponse(response, res);
        }

        showCards(req:express.Request, res:express.Response) {
            var response = Router.makeResponse(200, "...");
            try {
                response.data.text = this.currentGame.getPlayerHand(Router.getPlayerName(req));
            }
            catch (e) {
                response = Router.makeResponse(400, e);
            }
            Router.sendResponse(response, res);
        }

        playCard(req:express.Request, res:express.Response) {
            var player = Router.getPlayerName(req);
            var card:Card = new Card(req.body.suit, req.body.value);
            var response = Router.makeResponse(200, `${player} played ${card.toString()}. You're up, ${this.currentGame.nextPlayerInSequence.name}.`);
            try {
                var gameOver:boolean = this.currentGame.playCard(player, card);
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
                response = Router.makeResponse(400, `Error! ${e}! Current player: ${this.currentGame.nextPlayerInSequence}`);
            }
            Router.sendResponse(response, res);
        }
    }
}