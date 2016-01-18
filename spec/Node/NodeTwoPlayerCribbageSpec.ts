/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../CardService/Base Classes/Collections/Hand.ts" />
/// <reference path="../../CardService/Implementations/CribbagePlayer.ts" />
/// <reference path="../../CardService/Implementations/CribbageTeam.ts" />
/// <reference path="../../CardService/Implementations/Cribbage.ts" />
/// <reference path="../../CardService/Base Classes/CardGame.ts" />

import {BaseCard, Suit, Value} from "../../CardService/Base Classes/Items/Card";
import {BaseHand} from "../../CardService/Base Classes/Collections/Hand";
import {CribbagePlayer} from "../../CardService/Implementations/CribbagePlayer";
import {CribbageTeam} from "../../CardService/Implementations/CribbageTeam";
import {Cribbage, CribbageGameDescription, CribbageErrorStrings} from "../../CardService/Implementations/Cribbage";
import {BaseCardGame, Players, Sequence} from "../../CardService/Base Classes/CardGame";
import {CribbageHand} from "../../CardService/Implementations/CribbageHand";
import {ItemCollection} from "../../CardService/Base Classes/Collections/ItemCollection";
import {setup, CribbageRoutePrefix} from "../../app";
import {createNewServer} from "./setup";
import {CribbageRoutes, CribbageStrings} from "../../routes/Cribbage/index";
import Response = Express.Response;

"use strict";

var request = require("supertest"),
    async   = require("async"),
    expect  = require("expect");

describe("Integration test the Cribbage game between two players", function() {
    var PeterGriffin:CribbagePlayer, HomerSimpson:CribbagePlayer;

    /*
       Before each test, make sure to create a fresh instance of the application
       in order to ensure the state of the server is reset between each test run
     */
    beforeEach(function() {
        createNewServer(this);
        PeterGriffin = new CribbagePlayer("Peter Griffin", new CribbageHand([]));
        HomerSimpson = new CribbagePlayer("Homer Simpson", new CribbageHand([]));
    });

    function joinGameJson(player:CribbagePlayer): string {
        return '{"player": { "name": "' + player.name + '" } }';
    }

    function joinGameAndBeginSeries(agent) {
        return [
            function(cb) {
                // Reset the game
                agent.post(CribbageRoutePrefix + CribbageRoutes.Routes.resetGame)
                    .type('json')
                    .send('{"secret":"secret"}')
                    .expect(200, cb);
            },
            function(cb) {
                // Peter Griffin joins the game
                agent.post(CribbageRoutePrefix + CribbageRoutes.Routes.joinGame)
                    .type('json')
                    .send(joinGameJson(PeterGriffin))
                    .expect(200, cb);
            },
            function(cb) {
                // Homer Simpson joins the game
                agent.post(CribbageRoutePrefix + CribbageRoutes.Routes.joinGame)
                    .type('json')
                    .send(joinGameJson(HomerSimpson))
                    .expect(200, cb);
            },
            function(cb) {
                // Begin the game
                agent.get(CribbageRoutePrefix + CribbageRoutes.Routes.beginGame)
                    .expect(200)
                    .expect(CribbageStrings.MessageStrings.START_GAME, cb);
            }
        ];
    }

    it("lets players join the game and begin", function(done) {
        var agent = request(this.app);
        async.series(joinGameAndBeginSeries(agent), done);
    });

    it("describes the current game", function(done) {
        var agent = request(this.app);
        var series = joinGameAndBeginSeries(agent).concat(
            function(cb) {
                //Get the description
                agent.get(CribbageRoutePrefix + CribbageRoutes.Routes.describe)
                    .expect(200)
                    .expect(function(res) {
                        var description:CribbageGameDescription = JSON.parse(res.text);
                        var hasDealer = (description.dealer == PeterGriffin.name || description.dealer == HomerSimpson.name);
                        expect(hasDealer).toBe(true);
                    })
                    .end(cb);
            });
        async.series(series, done);
    });
});