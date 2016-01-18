/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../../CardService/Implementations/Cribbage.ts" />
/// <reference path="../../CardService/Implementations/CribbageHand.ts" />
/// <reference path="../../CardService/Implementations/CribbagePlayer.ts" />
/// <reference path="../../CardService/Base Classes/CardGame.ts" />

import * as express from "express";

import {CribbagePlayer} from "../../CardService/Implementations/CribbagePlayer";
import {Cribbage} from "../../CardService/Implementations/Cribbage";
import {CribbageHand} from "../../CardService/Implementations/CribbageHand";
import {Players, Teams} from "../../CardService/Base Classes/CardGame";
import {BaseCard as Card} from "../../CardService/Base Classes/Items/Card";

export module CribbageStrings {
    export class MessageStrings {
        static START_GAME:string = "The game is afoot, throw your cards to the crib.";
        static GAME_RESET:string = "The game was reset";
    }
    export class ErrorStrings {
        static NO_GAME:string = "The game hasn't been created. Add some players first.";
    }
}

class CribbageResponse {
    constructor(public status:number, public message:string) {
    }
}

export class CribbageRoutes {

    currentGame:Cribbage;

    static Routes = {
        joinGame: "/joinGame",
        beginGame: "/beginGame",
        resetGame: "/resetGame",
        describe: "/describe"
    };


    /* ***** Helper Methods ***** */

    private static sendResponse(response:CribbageResponse, res:express.Response) {
        res.status(response.status).send(response.message);
    }

    /**
     * NOTE:
     * A new Game should be created by players joining the game via "joinGame",
     * then calling "beginGame" when all have joined
     */

    /* ***** ROUTES ***** */

    /* ***** Initializing the Game ***** */

    joinGame(req:express.Request, res:express.Response) {
        var playerName = req.body.player.name;
        var newPlayer = new CribbagePlayer(playerName, new CribbageHand([]));
        var response = new CribbageResponse(200, "Welcome, " + playerName);
        if (this.currentGame == null) {
            this.currentGame = new Cribbage(new Players([newPlayer]))
        }
        else {
            try {
                this.currentGame.addPlayer(newPlayer);
            }
            catch (e) {
                response.status = 500;
                response.message = e;
            }
        }
        CribbageRoutes.sendResponse(response, res);
    }

    beginGame(req:express.Request, res:express.Response) {
        var response = new CribbageResponse(200, CribbageStrings.MessageStrings.START_GAME);
        if (this.currentGame == null) {
            response.status = 500;
            response.message = CribbageStrings.ErrorStrings.NO_GAME;
        }
        else {
            try {
                this.currentGame.begin();
            }
            catch (e) {
                response.status = 400;
                // SB TODO: Elaborate on what went wrong
                response.message = "Cannot start the game, an error has occurred";
            }
        }
        CribbageRoutes.sendResponse(response, res);
    }

    resetGame(req:express.Request, res:express.Response) {
        // SB TODO: Have a better way to have a secret on the server so that trolls can't keep resetting the game
        var secret = req.body.secret;
        var response = new CribbageResponse(400, "You're not authorized!!");
        if (secret != null && secret == "secret") {
            // Allow the game to be reset
            response.status = 200;
            response.message = CribbageStrings.MessageStrings.GAME_RESET;
            this.currentGame = new Cribbage(new Players<CribbagePlayer>([]));
        }
        CribbageRoutes.sendResponse(response, res);
    }


    /* ***** Run of play ***** */

    queryState(req:express.Request, res:express.Response) {
        var response = new CribbageResponse(200, (this.currentGame ? this.currentGame.describe() : "not started"));
        CribbageRoutes.sendResponse(response, res);
    }

    playCard(req:express.Request, res:express.Response) {
        var player = req.body.player.name;
        var card:Card = new Card(req.body.suit, req.body.value);
        var response = new CribbageResponse(200, "");
        try {
            var gameOver:boolean = this.currentGame.playCard(player, card);
            if (gameOver) {
                var winners = "";
                for (var ix = 0; ix < this.currentGame.players.countItems(); ix++) {
                    winners += (this.currentGame.players.itemAt(ix).name + ", ");
                }
                // Remove last two chars
                winners = winners.substring(0, winners.length - 2);
                response.message = "Game over. Winners: " + winners;
            }
            else {
                response.message = "Your turn, " + this.currentGame.nextPlayerInSequence.name;
            }
        }
        catch (e) {
            response.status = 400;
            response.message = "Error! Something went wrong! Current player: " + this.currentGame.nextPlayerInSequence;
        }
        CribbageRoutes.sendResponse(response, res);
    }
}
