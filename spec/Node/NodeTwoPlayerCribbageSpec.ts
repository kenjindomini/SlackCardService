/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../card_service/base_classes/collections/hand.ts" />
/// <reference path="../../card_service/implementations/cribbage_player.ts" />
/// <reference path="../../card_service/implementations/cribbage_team.ts" />
/// <reference path="../../card_service/implementations/cribbage.ts" />
/// <reference path="../../card_service/base_classes/card_game.ts" />

import {BaseCard, Suit, Value} from "../../card_service/base_classes/items/card";
import {BaseHand} from "../../card_service/base_classes/collections/hand";
import {CribbagePlayer} from "../../card_service/implementations/cribbage_player";
import {CribbageTeam} from "../../card_service/implementations/cribbage_team";
import {Cribbage, CribbageGameDescription, CribbageErrorStrings} from "../../card_service/implementations/cribbage";
import {BaseCardGame, Players, Sequence} from "../../card_service/base_classes/card_game";
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";
import {ItemCollection} from "../../card_service/base_classes/collections/item_collection";
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