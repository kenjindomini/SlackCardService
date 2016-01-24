var cribbage_1 = require("../../card_service/implementations/cribbage");
var Cribbage_1 = require("../../routes/Cribbage");
var card_1 = require("../../card_service/base_classes/items/card");
var Router = Cribbage_1.CribbageRoutes.Router;
describe("Test the logic of the CribbageRoutes module", function () {
    describe("Test parsing cards", function () {
        var aceOfSpaces = new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Ace), fourOfHearts = new card_1.BaseCard(card_1.Suit.Hearts, card_1.Value.Four), tenOfClubs = new card_1.BaseCard(card_1.Suit.Clubs, card_1.Value.Ten), queenOfDiamonds = new card_1.BaseCard(card_1.Suit.Diamonds, card_1.Value.Queen);
        it("parses one card correctly", function () {
            var cards = Router.parseCards("AS");
            expect(cards.length).toEqual(1);
            expect(cards[0].equalsOther(aceOfSpaces)).toBe(true);
        });
        it("parses two cards correctly", function () {
            var cards = Router.parseCards("AS 4H");
            expect(cards.length).toEqual(2);
            expect(cards[0].equalsOther(aceOfSpaces)).toBe(true);
            expect(cards[1].equalsOther(fourOfHearts)).toBe(true);
        });
        it("parses multiple cards correctly", function () {
            var cards = Router.parseCards("AS 4H 10C QD");
            expect(cards.length).toEqual(4);
            expect(cards[0].equalsOther(aceOfSpaces)).toBe(true);
            expect(cards[1].equalsOther(fourOfHearts)).toBe(true);
            expect(cards[2].equalsOther(tenOfClubs)).toBe(true);
            expect(cards[3].equalsOther(queenOfDiamonds)).toBe(true);
        });
        it("strips all spaces", function () {
            var cards = Router.parseCards("  AS  4H  ");
            expect(cards.length).toEqual(2);
            expect(cards[0].equalsOther(aceOfSpaces)).toBe(true);
            expect(cards[1].equalsOther(fourOfHearts)).toBe(true);
        });
        it("does a case-insensitive match", function () {
            var lowerCards = Router.parseCards("as 4h");
            var upperCards = Router.parseCards("AS 4H");
            expect(lowerCards.length).toEqual(upperCards.length);
            expect(lowerCards[0].equalsOther(upperCards[0])).toBe(true);
            expect(lowerCards[1].equalsOther(upperCards[1])).toBe(true);
        });
        it("throws when the syntax is wrong", function () {
            expect(function () { return Router.parseCards("11H"); }).toThrow(cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX);
            expect(function () { return Router.parseCards("lolwut"); }).toThrow(cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX);
            expect(function () { return Router.parseCards(""); }).toThrow(cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX);
            expect(function () { return Router.parseCards(null); }).toThrow(cribbage_1.CribbageStrings.ErrorStrings.INVALID_CARD_SYNTAX);
        });
    });
});
//# sourceMappingURL=RoutesSpec.js.map