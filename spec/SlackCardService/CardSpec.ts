/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../CardService/Base Classes/Items/card.ts" />

import {BaseCard, Suit, Value} from "../../CardService/Base Classes/Items/card";

describe("Test the BaseCard", function() {
    it("should print its name correctly", function () {
        var card = new BaseCard(Suit.Spades, Value.Ace);
        expect(card.toString()).toEqual("Ace of Spades");
    });
});