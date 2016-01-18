var standard_deck_1 = require("../../card_service/implementations/standard_deck");
var card_1 = require("../../card_service/base_classes/items/card");
describe("Test the Standard Deck's functionality", function () {
    var deck;
    beforeEach(function () {
        deck = new standard_deck_1.StandardDeck();
    });
    function makeDeckCopy(cards) {
        var copy = [];
        for (var card in cards) {
            copy.push(new card_1.BaseCard(card.suit, card.value));
        }
        return copy;
    }
    it("should actually shuffle", function () {
        var original = makeDeckCopy(deck.items);
        deck.shuffle();
        var orderIsDifferent = false;
        for (var ix = 0; ix < original.length; ix++) {
            if (!original[ix].equalsOther(deck.items[ix])) {
                orderIsDifferent = true;
                break;
            }
        }
        expect(orderIsDifferent).toBe(true);
    });
    it("should draw from the top of the deck", function () {
        var topCard = deck.items[0];
        var draw = deck.draw();
        expect(topCard.equalsOther(draw)).toBe(true);
        expect(topCard.equalsOther(deck.items[0])).toBe(false);
    });
    it("should random draw a card and put it back", function () {
        var card = deck.randomDraw(true);
        expect(deck.items).toContain(card);
    });
    it("should random draw a card and not put it back", function () {
        var card = deck.randomDraw(false);
        expect(deck.items).not.toContain(card);
    });
});
//# sourceMappingURL=StandardDeckSpec.js.map