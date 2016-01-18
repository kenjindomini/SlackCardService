var card_1 = require("../../card_service/base_classes/items/card");
describe("Test the BaseCard", function () {
    it("should print its name correctly", function () {
        var card = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace);
        expect(card.toString()).toEqual("Ace of Spades");
    });
});
//# sourceMappingURL=CardSpec.js.map