var card_1 = require("../../CardService/Base Classes/Items/card");
var cribbage_player_1 = require("../../CardService/Implementations/cribbage_player");
var cribbage_hand_1 = require("../../CardService/Implementations/cribbage_hand");
describe("Test the Cribbage Player's functionality", function () {
    var player;
    var duplicateCard;
    beforeEach(function () {
        duplicateCard = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace);
        player = new cribbage_player_1.CribbagePlayer("Bob", new cribbage_hand_1.CribbageHand([
            duplicateCard,
            new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Four),
            new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Jack),
            new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.King)
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