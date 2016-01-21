var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var card_game_1 = require("../base_classes/card_game");
var item_collection_1 = require("../base_classes/collections/item_collection");
var cribbage_hand_1 = require("./cribbage_hand");
var cribbage_player_1 = require("./cribbage_player");
var cribbage_team_1 = require("./cribbage_team");
var standard_deck_1 = require("./standard_deck");
"use strict";
var Mode;
(function (Mode) {
    Mode[Mode["FFA"] = 0] = "FFA";
    Mode[Mode["Team"] = 1] = "Team";
})(Mode || (Mode = {}));
var CribbageErrorStrings = (function () {
    function CribbageErrorStrings() {
    }
    CribbageErrorStrings.INVALID_NUMBER_OF_PLAYERS = "Invalid number of players";
    CribbageErrorStrings.INVALID_NUM_CARDS_THROWN_TO_KITTY = "Invalid number of cards given to the kitty";
    CribbageErrorStrings.INVALID_THROWER = "You aren't allowed to throw any cards!";
    CribbageErrorStrings.KITTY_NOT_READY = "The kitty still needs people to throw to it";
    CribbageErrorStrings.EXCEEDS_31 = "Exceeds 31";
    CribbageErrorStrings.FMT_NOT_NEXT_PLAYER = "The next player is ";
    CribbageErrorStrings.PLAYER_DOESNT_HAVE_CARD = "You don't have that card!";
    CribbageErrorStrings.PLAYER_DOES_NOT_EXIST = "You're not part of the game!";
    CribbageErrorStrings.PLAYER_ALREADY_IN_GAME = "You're already in the game";
    CribbageErrorStrings.PLAYER_CAN_PLAY = "You have a card you can still play";
    CribbageErrorStrings.PLAYER_NOT_IN_PLAY = "You've already said \"go\"";
    return CribbageErrorStrings;
})();
exports.CribbageErrorStrings = CribbageErrorStrings;
var CribbageGameDescription = (function () {
    function CribbageGameDescription(dealer, nextPlayer, cutCard, count, sequence, scores, players) {
        this.dealer = dealer;
        this.nextPlayer = nextPlayer;
        this.cutCard = cutCard;
        this.count = count;
        this.sequence = sequence;
        this.scores = scores;
        this.players = players;
    }
    return CribbageGameDescription;
})();
exports.CribbageGameDescription = CribbageGameDescription;
var Cribbage = (function (_super) {
    __extends(Cribbage, _super);
    function Cribbage(players) {
        _super.call(this, players, null, "Cribbage", new standard_deck_1.StandardDeck());
        this.cut = this.dealer = this.nextPlayerInSequence = this.sequence = this.winningTeam = null;
        this.count = 0;
        this.kitty = new cribbage_hand_1.CribbageHand([]);
        this.playersInPlay = new item_collection_1.ItemCollection([]);
        this.sequence = new card_game_1.Sequence();
    }
    Cribbage.prototype.initializeGame = function () {
        this.numPlayers = this.players.countItems();
        if (this.numPlayers < 2 || this.numPlayers > 6)
            throw CribbageErrorStrings.INVALID_NUMBER_OF_PLAYERS;
        this.mode = (this.numPlayers == 4 || this.numPlayers == 6 ? Mode.Team : Mode.FFA);
        if (this.mode == Mode.Team) {
            if (this.numPlayers == 4) {
                this.teams = new card_game_1.Teams(new item_collection_1.ItemCollection([
                    new cribbage_team_1.CribbageTeam(1, [this.players.itemAt(0), this.players.itemAt(2)]),
                    new cribbage_team_1.CribbageTeam(2, [this.players.itemAt(1), this.players.itemAt(3)])
                ]));
            }
            else {
                this.teams = new card_game_1.Teams(new item_collection_1.ItemCollection([
                    new cribbage_team_1.CribbageTeam(1, [this.players.itemAt(0), this.players.itemAt(3)]),
                    new cribbage_team_1.CribbageTeam(2, [this.players.itemAt(1), this.players.itemAt(4)]),
                    new cribbage_team_1.CribbageTeam(3, [this.players.itemAt(2), this.players.itemAt(5)])
                ]));
            }
        }
        else {
            if (this.teams != null) {
                this.teams.removeAll();
            }
            else {
                this.teams = new card_game_1.Teams(new item_collection_1.ItemCollection([]));
            }
            var id = 1;
            for (var index = 0; index < this.players.countItems(); index++, id++) {
                this.teams.addTeam(new cribbage_team_1.CribbageTeam(id, [this.players.itemAt(index)]));
            }
        }
    };
    Cribbage.prototype.isReady = function () {
        return (this.kitty ? (this.kitty.countItems() == 4) : false);
    };
    Cribbage.prototype.begin = function () {
        this.initializeGame();
        this.cutForDealer();
        this.deal();
    };
    Cribbage.prototype.giveToKitty = function (playerName, cards) {
        var player = this.findPlayer(playerName);
        if (!player)
            throw CribbageErrorStrings.PLAYER_DOES_NOT_EXIST;
        var numThrown = cards.countItems();
        for (var ix = 0; ix < numThrown; ix++) {
            if (player.hand.indexOfItem(cards.itemAt(ix)) == -1) {
                throw CribbageErrorStrings.PLAYER_DOESNT_HAVE_CARD;
            }
        }
        switch (this.numPlayers) {
            case 2:
                if (numThrown != 2) {
                    throw CribbageErrorStrings.INVALID_NUM_CARDS_THROWN_TO_KITTY;
                }
                break;
            case 3:
            case 4:
            case 5:
            case 6:
                if (numThrown != 1) {
                    throw CribbageErrorStrings.INVALID_NUM_CARDS_THROWN_TO_KITTY;
                }
                else if (this.numPlayers == 5 && player.equalsOther(this.dealer)) {
                    throw CribbageErrorStrings.INVALID_THROWER;
                }
                else if (this.numPlayers == 6) {
                    var team = this.findTeam(player);
                    for (var ix = 0; ix < team.countPlayers(); ix++) {
                        if (team.playerAt(ix).equalsOther(this.dealer)) {
                            throw CribbageErrorStrings.INVALID_THROWER;
                        }
                    }
                }
                break;
        }
        for (var ix = 0; ix < numThrown; ix++) {
            player.hand.playCard(player.hand.itemAt(player.hand.indexOfItem(cards.itemAt(ix))));
        }
        var card = null;
        for (var index = 0; index < cards.countItems(); index++) {
            card = cards.itemAt(index);
            this.kitty.takeCard(card);
        }
        if (this.kitty.size() == 4) {
            this.cutTheDeck();
        }
    };
    Cribbage.prototype.playCard = function (playerName, card) {
        if (this.kitty.size() != 4) {
            throw CribbageErrorStrings.KITTY_NOT_READY;
        }
        var player = this.findPlayer(playerName);
        if (!player.equalsOther(this.nextPlayerInSequence)) {
            throw CribbageErrorStrings.FMT_NOT_NEXT_PLAYER + this.nextPlayerInSequence.name;
        }
        var gameOver = false;
        while (true) {
            var team = this.teams.findTeam(player);
            var cardValue = cribbage_hand_1.CribbageHand.getCardValue(card.value);
            if ((this.count + cardValue) > 31) {
                throw CribbageErrorStrings.EXCEEDS_31;
            }
            if (!player.playCard(card)) {
                throw CribbageErrorStrings.PLAYER_DOESNT_HAVE_CARD;
            }
            this.count += cardValue;
            var points = this.sequence.addCard(card);
            if (points > 0) {
                if (team.addPoints(player, points)) {
                    this.winningTeam = team;
                    gameOver = true;
                    break;
                }
            }
            var sequenceOver = (this.count == 31);
            if (this.count == 15 || sequenceOver) {
                if (team.addPoints(player, 2)) {
                    this.winningTeam = team;
                    gameOver = true;
                    break;
                }
                if (sequenceOver) {
                    this.count = 0;
                }
            }
            if (this.roundOver()) {
                this.countPoints();
                this.setNextDealer();
                this.deal();
            }
            this.nextPlayerInSequence = this.nextPlayerInOrder(this.nextPlayerInSequence);
            break;
        }
        return gameOver;
    };
    Cribbage.prototype.go = function (playerName) {
        var player = this.findPlayer(playerName);
        if (player == null) {
            throw CribbageErrorStrings.PLAYER_DOES_NOT_EXIST;
        }
        if (player.canPlay(this.count)) {
            throw CribbageErrorStrings.PLAYER_CAN_PLAY;
        }
        else if (this.playersInPlay.indexOfItem(player) == -1) {
            throw CribbageErrorStrings.PLAYER_NOT_IN_PLAY;
        }
        else {
            this.playersInPlay.removeItem(player);
        }
        if (this.playersInPlay.countItems() == 0) {
            var team = this.findTeam(player);
            if (team.addPoints(player, 1)) {
                this.winningTeam = team;
                return true;
            }
            if (this.roundOver()) {
                this.countPoints();
                this.setNextDealer();
                this.deal();
            }
            else {
                this.count = 0;
                this.sequence.removeAll();
                this.playersInPlay.addItems(this.players.items);
                this.nextPlayerInSequence = this.nextPlayerInOrder(player);
            }
        }
        else if (this.nextPlayerInSequence.equalsOther(player)) {
            do {
                this.nextPlayerInSequence = this.nextPlayerInOrder(this.nextPlayerInSequence);
            } while (this.playersInPlay.indexOfItem(this.nextPlayerInSequence) == -1);
        }
        return false;
    };
    Cribbage.prototype.addPlayer = function (player) {
        if (this.findPlayer(player.name)) {
            throw CribbageErrorStrings.PLAYER_ALREADY_IN_GAME;
        }
        else {
            this.players.addPlayer(player);
        }
    };
    Cribbage.prototype.describe = function () {
        var scores = "";
        if (this.teams) {
            for (var ix = 0; ix < this.teams.numTeams(); ix++) {
                scores += "{ ";
                var team = this.teams.teams.itemAt(ix);
                for (var jx = 0; jx < team.numPlayers(); jx++) {
                    scores += (team.itemAt(jx).name + ", ");
                }
                scores = card_game_1.removeLastTwoChars(scores);
                scores += (" = " + team.countPoints() + " }, ");
            }
            scores = card_game_1.removeLastTwoChars(scores);
        }
        var players = [];
        for (var jx = 0; jx < this.players.countItems(); jx++) {
            players.push(this.players.itemAt(jx).name);
        }
        return JSON.stringify(new CribbageGameDescription((this.dealer ? this.dealer.name : ""), (this.nextPlayerInSequence ? this.nextPlayerInSequence.name : ""), (this.cut ? this.cut.toString() : ""), this.count, this.sequence.toString(), scores, players));
    };
    Cribbage.prototype.getPlayerHand = function (playerName) {
        var hand = "";
        console.log("Trying to find " + playerName);
        var player = this.findPlayer(playerName);
        if (player != null) {
            console.log("Found " + playerName + ", now iterate the cards in their hand");
            for (var ix = 0; ix < player.numCards(); ix++) {
                hand += player.hand.itemAt(ix).toString() + ", ";
            }
            hand = card_game_1.removeLastTwoChars(hand);
            console.log(playerName + " has hand " + hand);
        }
        else {
            throw CribbageErrorStrings.PLAYER_DOES_NOT_EXIST;
        }
        return hand;
    };
    Cribbage.prototype.findPlayer = function (playerName) {
        var player = null;
        var match = new cribbage_player_1.CribbagePlayer(playerName, new cribbage_hand_1.CribbageHand([]));
        for (var index = 0; index < this.players.countItems(); index++) {
            var tmp = this.players.itemAt(index);
            if (tmp.equalsOther(match)) {
                player = tmp;
                break;
            }
        }
        return player;
    };
    Cribbage.prototype.roundOver = function () {
        var done = true;
        for (var index = 0; index < this.players.countItems(); index++) {
            if (this.players.itemAt(index).hand.size() > 0) {
                done = false;
                break;
            }
        }
        return done;
    };
    Cribbage.prototype.countPoints = function () {
        var firstPlayer = this.nextPlayerInOrder(this.dealer);
        var countingPlayer = firstPlayer;
        do {
            var team = this.findTeam(countingPlayer);
            if (team.addPoints(countingPlayer, countingPlayer.countPoints(this.cut))) {
                this.winningTeam = team;
                return true;
            }
            if (this.dealer.equalsOther(countingPlayer)) {
                if (team.addPoints(countingPlayer, this.kitty.countPoints(this.cut, true))) {
                    this.winningTeam = team;
                    return true;
                }
            }
            countingPlayer = this.nextPlayerInOrder(countingPlayer);
        } while (!countingPlayer.equalsOther(firstPlayer));
        return false;
    };
    Cribbage.prototype.cutForDealer = function () {
        var lowest = null;
        for (var index = 0; index < this.numPlayers; index++) {
            var card = this.deck.randomDraw(false);
            if (lowest == null || card.value < lowest.value) {
                lowest = card;
                this.dealer = this.players.itemAt(index);
            }
        }
        this.nextPlayerInSequence = this.nextPlayerInOrder(this.dealer);
    };
    Cribbage.prototype.resetHands = function () {
        for (var index = 0; index < this.numPlayers; index++) {
            this.players.itemAt(index).hand.removeAll();
        }
    };
    Cribbage.prototype.deal = function () {
        this.sequence.removeAll();
        this.resetHands();
        this.shuffle();
        this.playersInPlay.removeAll();
        this.playersInPlay.addItems(this.players.items);
        switch (this.numPlayers) {
            case 2:
                this.dealForTwo();
                break;
            case 3:
                this.dealForThree();
                break;
            case 4:
                this.dealForFour();
                break;
            case 5:
                this.dealForFive();
                break;
            case 6:
                this.dealForSix();
                break;
            default:
                throw CribbageErrorStrings.INVALID_NUMBER_OF_PLAYERS;
        }
    };
    Cribbage.prototype.cutTheDeck = function () {
        this.cut = this.deck.randomDraw(false);
    };
    Cribbage.prototype.draw = function () {
        return this.deck.draw();
    };
    Cribbage.prototype.dealForTwo = function () {
        var player = this.nextPlayerInOrder(this.dealer);
        while (player.numCards() < 6) {
            player.hand.takeCard(this.draw());
            player = this.nextPlayerInOrder(player);
        }
    };
    Cribbage.prototype.dealForThree = function () {
        var player = this.nextPlayerInOrder(this.dealer);
        while (player.numCards() < 5) {
            player.takeCard(this.draw());
            player = this.nextPlayerInOrder(player);
        }
        if (this.kitty == null) {
            this.kitty = new cribbage_hand_1.CribbageHand([]);
        }
        this.kitty.takeCard(this.draw());
    };
    Cribbage.prototype.dealForFour = function () {
        var player = this.nextPlayerInOrder(this.dealer);
        while (player.numCards() < 5) {
            player.takeCard(this.draw());
            player = this.nextPlayerInOrder(player);
        }
    };
    Cribbage.prototype.dealForFive = function () {
        throw "Not Implemented!";
    };
    Cribbage.prototype.dealForSix = function () {
        var player = this.nextPlayerInOrder(this.dealer);
        var dealingTeam = this.findTeam(this.dealer);
        while (player.numCards() < 5) {
            if (!(player.equalsOther(this.dealer) || dealingTeam.equalsOther(this.findTeam(player)))) {
                player.takeCard(this.draw());
            }
        }
    };
    Cribbage.prototype.setNextDealer = function () {
        this.dealer = this.nextPlayerInOrder(this.dealer);
        this.nextPlayerInSequence = this.nextPlayerInOrder(this.dealer);
    };
    Cribbage.prototype.nextPlayerInOrder = function (player) {
        var index = this.players.indexOfItem(player);
        if ((index + 1) >= this.numPlayers) {
            index = 0;
        }
        else {
            index++;
        }
        return this.players.itemAt(index);
    };
    Cribbage.prototype.findTeam = function (player) {
        var team = null;
        for (var index = 0; index < this.teams.numTeams(); index++) {
            var t = this.getTeam(index);
            if (t.hasPlayer(player)) {
                team = t;
                break;
            }
        }
        return team;
    };
    return Cribbage;
})(card_game_1.BaseCardGame);
exports.Cribbage = Cribbage;
//# sourceMappingURL=cribbage.js.map