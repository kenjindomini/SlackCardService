var Hand_1 = require("../../CardService/Base Classes/Collections/Hand");
var Card_1 = require("../../CardService/Base Classes/Items/Card");
var Player_1 = require("../../CardService/Base Classes/Items/Player");
describe("Test the Base Player's functionality", function () {
    var player;
    beforeEach(function () {
        player = new Player_1.BasePlayer("Bob", new Hand_1.BaseHand([
            new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Ace),
            new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Ten),
            new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Queen),
            new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.King)
        ]));
    });
    it("equals another player with the same name", function () {
        var other = new Player_1.BasePlayer("Bob", new Hand_1.BaseHand([]));
        expect(player.equalsOther(other)).toBe(true);
    });
    it("is not equal to another player with a different name", function () {
        var other = new Player_1.BasePlayer("Bob Pfeffer", new Hand_1.BaseHand([]));
        expect(player.equalsOther(other)).toBe(false);
    });
});
//# sourceMappingURL=PlayerSpec.js.map