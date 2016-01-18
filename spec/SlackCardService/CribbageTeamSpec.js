var cribbage_player_1 = require("../../CardService/Implementations/cribbage_player");
var cribbage_hand_1 = require("../../CardService/Implementations/cribbage_hand");
var cribbage_team_1 = require("../../CardService/Implementations/cribbage_team");
var card_1 = require("../../CardService/Base Classes/Items/card");
describe("Test the Cribbage Team's functionality", function () {
    var team;
    var playerOne;
    var playerTwo;
    beforeEach(function () {
        playerOne = new cribbage_player_1.CribbagePlayer("Bob", new cribbage_hand_1.CribbageHand([
            new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace),
            new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Six),
            new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Seven),
            new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Jack)
        ]));
        playerTwo = new cribbage_player_1.CribbagePlayer("Steve", new cribbage_hand_1.CribbageHand([
            new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Four),
            new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Seven),
            new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Queen),
            new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.King)
        ]));
        team = new cribbage_team_1.CribbageTeam(1, [playerOne, playerTwo]);
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
        expect(team.hasPlayer(new cribbage_player_1.CribbagePlayer("Alice", new cribbage_hand_1.CribbageHand([])))).toBe(false);
    });
});
//# sourceMappingURL=CribbageTeamSpec.js.map