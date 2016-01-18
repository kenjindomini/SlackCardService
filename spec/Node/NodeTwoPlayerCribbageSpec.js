var CribbagePlayer_1 = require("../../../CardService/Implementations/CribbagePlayer");
var CribbageHand_1 = require("../../../CardService/Implementations/CribbageHand");
var app_1 = require("../../app");
var setup_1 = require("./setup");
var index_1 = require("../../routes/Cribbage/index");
"use strict";
var request = require("supertest"), async = require("async"), expect = require("expect");
describe("Integration test the Cribbage game between two players", function () {
    var PeterGriffin, HomerSimpson;
    beforeEach(function () {
        setup_1.createNewServer(this);
        PeterGriffin = new CribbagePlayer_1.CribbagePlayer("Peter Griffin", new CribbageHand_1.CribbageHand([]));
        HomerSimpson = new CribbagePlayer_1.CribbagePlayer("Homer Simpson", new CribbageHand_1.CribbageHand([]));
    });
    function joinGameJson(player) {
        return '{"player": { "name": "' + player.name + '" } }';
    }
    function joinGameAndBeginSeries(agent) {
        return [
            function (cb) {
                agent.post(app_1.CribbageRoutePrefix + index_1.CribbageRoutes.Routes.resetGame)
                    .type('json')
                    .send('{"secret":"secret"}')
                    .expect(200, cb);
            },
            function (cb) {
                agent.post(app_1.CribbageRoutePrefix + index_1.CribbageRoutes.Routes.joinGame)
                    .type('json')
                    .send(joinGameJson(PeterGriffin))
                    .expect(200, cb);
            },
            function (cb) {
                agent.post(app_1.CribbageRoutePrefix + index_1.CribbageRoutes.Routes.joinGame)
                    .type('json')
                    .send(joinGameJson(HomerSimpson))
                    .expect(200, cb);
            },
            function (cb) {
                agent.get(app_1.CribbageRoutePrefix + index_1.CribbageRoutes.Routes.beginGame)
                    .expect(200)
                    .expect(index_1.CribbageStrings.MessageStrings.START_GAME, cb);
            }
        ];
    }
    it("lets players join the game and begin", function (done) {
        var agent = request(this.app);
        async.series(joinGameAndBeginSeries(agent), done);
    });
    it("describes the current game", function (done) {
        var agent = request(this.app);
        var series = joinGameAndBeginSeries(agent).concat(function (cb) {
            agent.get(app_1.CribbageRoutePrefix + index_1.CribbageRoutes.Routes.describe)
                .expect(200)
                .expect(function (res) {
                var description = JSON.parse(res.text);
                var hasDealer = (description.dealer == PeterGriffin.name || description.dealer == HomerSimpson.name);
                expect(hasDealer).toBe(true);
            })
                .end(cb);
        });
        async.series(series, done);
    });
});
//# sourceMappingURL=NodeTwoPlayerCribbageSpec.js.map