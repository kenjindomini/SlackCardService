var CribbagePlayer_1 = require("../../CardService/Implementations/CribbagePlayer");
var CribbageHand_1 = require("../../CardService/Implementations/CribbageHand");
var CribbageTeam_1 = require("../../CardService/Implementations/CribbageTeam");
var Card_1 = require("../../CardService/Base Classes/Items/Card");
describe("Test the Cribbage Team's functionality", function () {
    var team;
    var playerOne;
    var playerTwo;
    beforeEach(function () {
        playerOne = new CribbagePlayer_1.CribbagePlayer("Bob", new CribbageHand_1.CribbageHand([
            new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Ace),
            new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Six),
            new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Seven),
            new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Jack)
        ]));
        playerTwo = new CribbagePlayer_1.CribbagePlayer("Steve", new CribbageHand_1.CribbageHand([
            new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Four),
            new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Seven),
            new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Queen),
            new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.King)
        ]));
        team = new CribbageTeam_1.CribbageTeam(1, [playerOne, playerTwo]);
    });
    it("tracks points for the entire team", function () {
        expect(playerOne.points).toEqual(0);
        expect(playerTwo.points).toEqual(0);
        expect(team.countPoints()).toEqual(0);
        team.addPoints(playerOne, 2);
        team.addPoints(playerTwo, 7);
        expect(team.countPoints()).toEqual(9);
    });
    it("knows what players it has", function () {
        expect(team.hasPlayer(playerOne)).toBe(true);
        expect(team.hasPlayer(playerTwo)).toBe(true);
        expect(team.hasPlayer(new CribbagePlayer_1.CribbagePlayer("Alice", new CribbageHand_1.CribbageHand([])))).toBe(false);
    });
});
//# sourceMappingURL=CribbageTeamSpec.js.map