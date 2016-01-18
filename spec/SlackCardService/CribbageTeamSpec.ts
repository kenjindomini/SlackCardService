/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../CardService/Base Classes/Collections/hand.ts" />
/// <reference path="../../CardService/Implementations/cribbage_team.ts" />
/// <reference path="../../CardService/Implementations/cribbage_player.ts" />

import {CribbagePlayer} from "../../CardService/Implementations/cribbage_player";
import {CribbageHand} from "../../CardService/Implementations/cribbage_hand";
import {CribbageTeam} from "../../CardService/Implementations/cribbage_team";
import {BaseCard, Suit, Value} from "../../CardService/Base Classes/Items/card";

describe("Test the Cribbage Team's functionality", function() {
    var team;
    var playerOne;
    var playerTwo;
    beforeEach(function() {
        playerOne = new CribbagePlayer("Bob", new CribbageHand([
            new BaseCard(Suit.Spades, Value.Ace),
            new BaseCard(Suit.Clubs, Value.Six),
            new BaseCard(Suit.Diamonds, Value.Seven),
            new BaseCard(Suit.Hearts, Value.Jack)
        ]));
        playerTwo = new CribbagePlayer("Steve", new CribbageHand([
            new BaseCard(Suit.Spades, Value.Four),
            new BaseCard(Suit.Clubs, Value.Seven),
            new BaseCard(Suit.Diamonds, Value.Queen),
            new BaseCard(Suit.Hearts, Value.King)
        ]));
    	team = new CribbageTeam(1, [playerOne, playerTwo]);
    });
    it("tracks points for the entire team", function() {
        expect(playerOne.points).toEqual(0);
        expect(playerTwo.points).toEqual(0);
        expect(team.countPoints()).toEqual(0);
        team.addPoints(playerOne, 2);
        team.addPoints(playerTwo, 7);
        expect(team.countPoints()).toEqual(9);
    });
    it("knows what players it has", function () {
        expect(team.hasPlayer(playerOne)).toBe(true);
        expect(team.hasPlayer(playerTwo)).toBe(true);
        expect(team.hasPlayer(new CribbagePlayer("Alice", new CribbageHand([])))).toBe(false);
    });
});