var Card_1 = require("../../CardService/Base Classes/Items/Card");
var CribbagePlayer_1 = require("../../CardService/Implementations/CribbagePlayer");
var CribbageHand_1 = require("../../CardService/Implementations/CribbageHand");
describe("Test the Cribbage Player's functionality", function () {
    var player;
    var duplicateCard;
    beforeEach(function () {
        duplicateCard = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Ace);
        player = new CribbagePlayer_1.CribbagePlayer("Bob", new CribbageHand_1.CribbageHand([
            duplicateCard,
            new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Four),
            new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Jack),
            new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.King)
        ]));
    });
    it("tracks the cards it has played", function () {
        expect(player.playCard(duplicateCard)).toBe(true);
        expect(player.played.countItems()).toEqual(1);
        expect(player.played.items[0].equalsOther(duplicateCard)).toBe(true);
    });
    it("can reset its hand", function () {
        expect(player.hand.countItems()).toEqual(4);
        expect(player.playCard(duplicateCard)).toBe(true);
        expect(player.played.countItems()).toEqual(1);
        player.resetCards();
        expect(player.hand.countItems()).toEqual(0);
        expect(player.played.countItems()).toEqual(0);
    });
});
//# sourceMappingURL=CribbagePlayerSpec.js.map