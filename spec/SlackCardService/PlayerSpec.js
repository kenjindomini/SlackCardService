var hand_1 = require("../../card_service/base_classes/collections/hand");
var card_1 = require("../../card_service/base_classes/items/card");
var player_1 = require("../../card_service/base_classes/items/player");
describe("Test the Base Player's functionality", function () {
    var player;
    beforeEach(function () {
        player = new player_1.BasePlayer("Bob", new hand_1.BaseHand([
            new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace),
            new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Ten),
            new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Queen),
            new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.King)
        ]));
    });
    it("equals another player with the same name", function () {
        var other = new player_1.BasePlayer("Bob", new hand_1.BaseHand([]));
        expect(player.equalsOther(other)).toBe(true);
    });
    it("is not equal to another player with a different name", function () {
        var other = new player_1.BasePlayer("Bob Pfeffer", new hand_1.BaseHand([]));
        expect(player.equalsOther(other)).toBe(false);
    });
});
//# sourceMappingURL=PlayerSpec.js.map