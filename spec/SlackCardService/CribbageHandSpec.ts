/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../card_service/base_classes/collections/hand.ts" />
/// <reference path="../../card_service/implementations/cribbage_player.ts" />
/// <reference path="../../card_service/implementations/cribbage_team.ts" />
/// <reference path="../../card_service/implementations/cribbage.ts" />
/// <reference path="../../card_service/base_classes/card_game.ts" />

import {BaseCard, Suit, Value} from "../../card_service/base_classes/items/card";
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";

"use strict";

describe("Test a Cribbage game between two players", function() {
    var aceOfSpades = new BaseCard(Suit.Spades, Value.Ace),
        aceOfHearts = new BaseCard(Suit.Hearts, Value.Ace),
        aceOfDiamonds = new BaseCard(Suit.Diamonds, Value.Ace),
        aceOfClubs = new BaseCard(Suit.Clubs, Value.Ace),
        twoOfDiamonds = new BaseCard(Suit.Diamonds, Value.Two),
        twoOfClubs = new BaseCard(Suit.Clubs, Value.Two),
        twoOfHearts = new BaseCard(Suit.Hearts, Value.Two),
        twoOfSpades = new BaseCard(Suit.Spades, Value.Two),
        threeOfSpades = new BaseCard(Suit.Spades, Value.Three),
        threeOfDiamonds = new BaseCard(Suit.Diamonds, Value.Three),
        threeOfHearts = new BaseCard(Suit.Hearts, Value.Three),
        fourOfHearts = new BaseCard(Suit.Hearts, Value.Four),
        fourOfSpades = new BaseCard(Suit.Spades, Value.Four),
        fourOfClubs = new BaseCard(Suit.Clubs, Value.Four),
        fourOfDiamonds = new BaseCard(Suit.Diamonds, Value.Four),
        fiveOfHearts = new BaseCard(Suit.Hearts, Value.Five),
        fiveOfSpades = new BaseCard(Suit.Spades, Value.Five),
        fiveOfClubs = new BaseCard(Suit.Clubs, Value.Five),
        fiveOfDiamonds = new BaseCard(Suit.Diamonds, Value.Five),
        sixOfHearts = new BaseCard(Suit.Hearts, Value.Six),
        sixOfSpades = new BaseCard(Suit.Spades, Value.Six),
        sixOfClubs = new BaseCard(Suit.Clubs, Value.Six),
        sixOfDiamonds = new BaseCard(Suit.Diamonds, Value.Six),
        sevenOfSpades = new BaseCard(Suit.Spades, Value.Seven),
        sevenOfDiamonds = new BaseCard(Suit.Diamonds, Value.Seven),
        sevenOfHearts = new BaseCard(Suit.Hearts, Value.Seven),
        sevenOfClubs = new BaseCard(Suit.Clubs, Value.Seven),
        eightOfClubs = new BaseCard(Suit.Clubs, Value.Eight),
        eightOfHearts = new BaseCard(Suit.Hearts, Value.Eight),
        eightOfSpades = new BaseCard(Suit.Spades, Value.Eight),
        eightOfDiamonds = new BaseCard(Suit.Diamonds, Value.Eight),
        nineOfHearts = new BaseCard(Suit.Hearts, Value.Nine),
        nineOfDiamonds = new BaseCard(Suit.Diamonds, Value.Nine),
        tenOfClubs = new BaseCard(Suit.Clubs, Value.Ten),
        tenOfDiamonds = new BaseCard(Suit.Diamonds, Value.Ten),
        jackOfSpades = new BaseCard(Suit.Spades, Value.Jack),
        jackOfClubs = new BaseCard(Suit.Clubs, Value.Jack),
        jackOfHearts = new BaseCard(Suit.Hearts, Value.Jack),
        queenOfClubs = new BaseCard(Suit.Clubs, Value.Queen),
        queenOfHearts = new BaseCard(Suit.Hearts, Value.Queen),
        queenOfSpades = new BaseCard(Suit.Spades, Value.Queen),
        kingOfClubs = new BaseCard(Suit.Clubs, Value.King),
        kingOfHearts = new BaseCard(Suit.Hearts, Value.King),
        kingOfSpades = new BaseCard(Suit.Spades, Value.King);
    beforeEach(function() {
    });
    describe("Test various counting scenarios", function() {
        it("counts correctly", function() {
            var hand = new CribbageHand([aceOfClubs, fourOfHearts, eightOfClubs, eightOfHearts]);
            expect(hand.countPoints(queenOfSpades, false)).toEqual(4); // 15 for two points and a pair makes four points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([aceOfDiamonds, aceOfSpades, sixOfSpades, tenOfDiamonds]);
            expect(hand.countPoints(queenOfSpades, false)).toEqual(2); // 2 points for a pair of aces
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([aceOfClubs, fourOfHearts, tenOfDiamonds, tenOfClubs]);
            expect(hand.countPoints(fourOfSpades, false)).toEqual(12); // 15 for eight points and two pairs makes twelve points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([twoOfClubs, threeOfSpades, threeOfHearts, jackOfHearts]);
            expect(hand.countPoints(fourOfSpades, false)).toEqual(12); // 15 for four points and a double run of three makes 12 points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([aceOfClubs, aceOfDiamonds, aceOfHearts, fourOfClubs]);
            expect(hand.countPoints(fourOfSpades, false)).toEqual(8); // 6 for 3 of a kind and a pair makes eight points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([aceOfClubs, twoOfClubs, threeOfHearts, tenOfDiamonds]);
            expect(hand.countPoints(jackOfHearts, false)).toEqual(7); // 15 for four points and a run of three makes seven points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([twoOfClubs, threeOfSpades, threeOfHearts, jackOfSpades]);
            expect(hand.countPoints(jackOfHearts, false)).toEqual(12); // 15 for eight points and a two pair makes 12 points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([twoOfClubs, threeOfSpades, threeOfHearts, jackOfSpades]);
            expect(hand.countPoints(queenOfSpades, false)).toEqual(11); // 15 for eight points + a pair + right jack makes 11 points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([eightOfDiamonds, jackOfClubs, queenOfSpades, kingOfHearts]);
            expect(hand.countPoints(eightOfClubs, true)).toEqual(6); // A pair + a run of 3 + right jack makes 6 points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([twoOfClubs, twoOfDiamonds, twoOfHearts, twoOfSpades]);
            expect(hand.countPoints(fourOfHearts, true)).toEqual(12); // A pair + a run of 3 + right jack makes 6 points
        });
        it("counts correctly", function() {
            var hand = new CribbageHand([threeOfDiamonds, fourOfDiamonds, fiveOfDiamonds, sevenOfSpades]);
            expect(hand.countPoints(nineOfDiamonds, false)).toEqual(5); // A 15-2 and a run of 3 makes 5
        });
    });
});