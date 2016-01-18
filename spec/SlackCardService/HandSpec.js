var card_1 = require("../../CardService/Base Classes/Items/card");
var hand_1 = require("../../CardService/Base Classes/Collections/hand");
describe("Test the Hand's functionality", function () {
    var hand;
    beforeEach(function () {
        hand = new hand_1.BaseHand([]);
    });
    it("has no cards", function () {
        expect(hand.size()).toEqual(0);
    });
    it("does not play a card it doesn't have", function () {
        expect(hand.playCard(new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Ace))).toBe(false);
    });
    describe("Test a Hand with four cards", function () {
        var duplicateCard = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Eight);
        beforeEach(function () {
            hand.takeCard(duplicateCard);
            hand.takeCard(new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace));
            hand.takeCard(new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Jack));
            hand.takeCard(new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Four));
        });
        afterEach(function () {
            hand.removeAll();
        });
        it("has four cards", function () {
            expect(hand.size()).toEqual(4);
        });
        it("does not take a card it already has", function () {
            expect(hand.takeCard(duplicateCard)).toBe(false);
        });
        it("can play a card", function () {
            expect(hand.playCard(duplicateCard)).toBe(true);
            expect(hand.size()).toEqual(3);
        });
        it("can take a card", function () {
            expect(hand.takeCard(new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Ace))).toBe(true);
        });
    });
});
//# sourceMappingURL=HandSpec.js.map