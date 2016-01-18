var Card_1 = require("../../CardService/Base Classes/Items/Card");
describe("Test the BaseCard", function () {
    it("should print its name correctly", function () {
        var card = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Ace);
        expect(card.toString()).toEqual("Ace of Spades");
    });
});
//# sourceMappingURL=CardSpec.js.map