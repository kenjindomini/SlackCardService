var card_1 = require("../../card_service/base_classes/items/card");
var cribbage_hand_1 = require("../../card_service/implementations/cribbage_hand");
"use strict";
describe("Test a Cribbage game between two players", function () {
    var aceOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace), aceOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Ace), aceOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Ace), aceOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Ace), twoOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Two), twoOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Two), threeOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Three), threeOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Three), fourOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Four), fourOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Four), fourOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Four), fourOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Four), fiveOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Five), fiveOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Five), fiveOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Five), fiveOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Five), sixOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Six), sixOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Six), sixOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Six), sixOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Six), sevenOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Seven), sevenOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Seven), sevenOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Seven), sevenOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Seven), eightOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Eight), eightOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Eight), eightOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Eight), eightOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Eight), nineOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Nine), nineOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Nine), tenOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Ten), tenOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Ten), jackOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Jack), jackOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Jack), queenOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Queen), queenOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Queen), queenOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Queen), kingOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.King), kingOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.King), kingOfSpades = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.King);
    beforeEach(function () {
    });
    describe("Test various counting scenarios", function () {
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([aceOfClubs, fourOfHearts, eightOfClubs, eightOfHearts]);
            expect(hand.countPoints(queenOfSpades, false)).toEqual(4);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([aceOfDiamonds, aceOfSpades, sixOfSpades, tenOfDiamonds]);
            expect(hand.countPoints(queenOfSpades, false)).toEqual(2);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([aceOfClubs, fourOfHearts, tenOfDiamonds, tenOfClubs]);
            expect(hand.countPoints(fourOfSpades, false)).toEqual(12);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([twoOfClubs, threeOfSpades, threeOfHearts, jackOfHearts]);
            expect(hand.countPoints(fourOfSpades, false)).toEqual(12);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([aceOfClubs, aceOfDiamonds, aceOfHearts, fourOfClubs]);
            expect(hand.countPoints(fourOfSpades, false)).toEqual(8);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([aceOfClubs, twoOfClubs, threeOfHearts, tenOfDiamonds]);
            expect(hand.countPoints(jackOfHearts, false)).toEqual(7);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([twoOfClubs, threeOfSpades, threeOfHearts, jackOfSpades]);
            expect(hand.countPoints(jackOfHearts, false)).toEqual(12);
        });
        it("counts correctly", function () {
            var hand = new cribbage_hand_1.CribbageHand([twoOfClubs, threeOfSpades, threeOfHearts, jackOfSpades]);
            expect(hand.countPoints(queenOfSpades, false)).toEqual(11);
        });
    });
});
//# sourceMappingURL=CribbageHandSpec.js.map