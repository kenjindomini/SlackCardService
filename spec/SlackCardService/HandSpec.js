var Card_1 = require("../../CardService/Base Classes/Items/Card");
var Hand_1 = require("../../CardService/Base Classes/Collections/Hand");
describe("Test the Hand's functionality", function () {
    var hand;
    beforeEach(function () {
        hand = new Hand_1.BaseHand([]);
    });
    it("has no cards", function () {
        expect(hand.size()).toEqual(0);
    });
    it("does not play a card it doesn't have", function () {
        expect(hand.playCard(new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Ace))).toBe(false);
    });
    describe("Test a Hand with four cards", function () {
        var duplicateCard = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Eight);
        beforeEach(function () {
            hand.takeCard(duplicateCard);
            hand.takeCard(new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Ace));
            hand.takeCard(new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Jack));
            hand.takeCard(new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Four));
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
            expect(hand.takeCard(new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Ace))).toBe(true);
        });
    });
});
//# sourceMappingURL=HandSpec.js.map