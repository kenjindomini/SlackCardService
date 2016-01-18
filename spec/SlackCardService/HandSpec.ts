/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../CardService/Base Classes/Collections/hand.ts" />
/// <reference path="../../CardService/Base Classes/Items/card.ts" />

import {BaseCard, Suit, Value} from "../../CardService/Base Classes/Items/card";
import {BaseHand} from "../../CardService/Base Classes/Collections/hand";

describe("Test the Hand's functionality", function() {
    var hand;
    beforeEach(function() {
    	hand = new BaseHand([]);
    });
    it("has no cards", function () {
        expect(hand.size()).toEqual(0);
    });
    it("does not play a card it doesn't have", function () {
        expect(hand.playCard(new BaseCard(Suit.Clubs, Value.Ace))).toBe(false);
    });
    describe("Test a Hand with four cards", function() {
        var duplicateCard = new BaseCard(Suit.Clubs, Value.Eight);
    	beforeEach(function() {
    		hand.takeCard(duplicateCard);
            hand.takeCard(new BaseCard(Suit.Spades, Value.Ace));
            hand.takeCard(new BaseCard(Suit.Diamonds, Value.Jack));
            hand.takeCard(new BaseCard(Suit.Hearts, Value.Four));
    	});
        afterEach(function() {
        	hand.removeAll();
        });
        it("has four cards", function () {
            expect(hand.size()).toEqual(4);
        });
        it("does not take a card it already has", function () {
            expect(hand.takeCard(duplicateCard)).toBe(false);
        });
        it("can play a card", function () {
            expect(hand.playCard(duplicateCard)).toBe(true);
            expect(hand.size()).toEqual(3);
        });
        it("can take a card", function () {
            expect(hand.takeCard(new BaseCard(Suit.Clubs, Value.Ace))).toBe(true);
        });
    });
});

