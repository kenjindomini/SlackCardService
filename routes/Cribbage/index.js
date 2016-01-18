var CribbagePlayer_1 = require("../../../CardService/Implementations/CribbagePlayer");
var Cribbage_1 = require("../../../CardService/Implementations/Cribbage");
var CribbageHand_1 = require("../../../CardService/Implementations/CribbageHand");
var CardGame_1 = require("../../../CardService/Base Classes/CardGame");
var Card_1 = require("../../../CardService/Base Classes/Items/Card");
var CribbageStrings;
(function (CribbageStrings) {
    var MessageStrings = (function () {
        function MessageStrings() {
        }
        MessageStrings.START_GAME = "The game is afoot, throw your cards to the crib.";
        MessageStrings.GAME_RESET = "The game was reset";
        return MessageStrings;
    })();
    CribbageStrings.MessageStrings = MessageStrings;
    var ErrorStrings = (function () {
        function ErrorStrings() {
        }
        ErrorStrings.NO_GAME = "The game hasn't been created. Add some players first.";
        return ErrorStrings;
    })();
    CribbageStrings.ErrorStrings = ErrorStrings;
})(CribbageStrings = exports.CribbageStrings || (exports.CribbageStrings = {}));
var CribbageResponse = (function () {
    function CribbageResponse(status, message) {
        this.status = status;
        this.message = message;
    }
    return CribbageResponse;
})();
var CribbageRoutes = (function () {
    function CribbageRoutes() {
    }
    CribbageRoutes.sendResponse = function (response, res) {
        res.status(response.status).send(response.message);
    };
    CribbageRoutes.prototype.joinGame = function (req, res) {
        var playerName = req.body.player.name;
        var newPlayer = new CribbagePlayer_1.CribbagePlayer(playerName, new CribbageHand_1.CribbageHand([]));
        var response = new CribbageResponse(200, "Welcome, " + playerName);
        if (this.currentGame == null) {
            this.currentGame = new Cribbage_1.Cribbage(new CardGame_1.Players([newPlayer]));
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
    };
    CribbageRoutes.prototype.beginGame = function (req, res) {
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
                response.message = "Cannot start the game, an error has occurred";
            }
        }
        CribbageRoutes.sendResponse(response, res);
    };
    CribbageRoutes.prototype.resetGame = function (req, res) {
        var secret = req.body.secret;
        var response = new CribbageResponse(400, "You're not authorized!!");
        if (secret != null && secret == "secret") {
            response.status = 200;
            response.message = CribbageStrings.MessageStrings.GAME_RESET;
            this.currentGame = new Cribbage_1.Cribbage(new CardGame_1.Players([]));
        }
        CribbageRoutes.sendResponse(response, res);
    };
    CribbageRoutes.prototype.queryState = function (req, res) {
        var response = new CribbageResponse(200, (this.currentGame ? this.currentGame.describe() : "not started"));
        CribbageRoutes.sendResponse(response, res);
    };
    CribbageRoutes.prototype.playCard = function (req, res) {
        var player = req.body.player.name;
        var card = new Card_1.BaseCard(req.body.suit, req.body.value);
        var response = new CribbageResponse(200, "");
        try {
            var gameOver = this.currentGame.playCard(player, card);
            if (gameOver) {
                var winners = "";
                for (var ix = 0; ix < this.currentGame.players.countItems(); ix++) {
                    winners += (this.currentGame.players.itemAt(ix).name + ", ");
                }
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
    };
    CribbageRoutes.Routes = {
        joinGame: "/joinGame",
        beginGame: "/beginGame",
        resetGame: "/resetGame",
        describe: "/describe"
    };
    return CribbageRoutes;
})();
exports.CribbageRoutes = CribbageRoutes;
//# sourceMappingURL=index.js.map