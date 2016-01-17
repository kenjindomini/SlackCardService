/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../../CardService/Base Classes/Collections/Hand.ts" />
/// <reference path="../../../CardService/Base Classes/Items/Card.ts" />
/// <reference path="../../../CardService/Base Classes/Items/Player.ts" />

import {BaseHand} from "../../../CardService/Base Classes/Collections/Hand";
import {BaseCard, Suit, Value} from "../../../CardService/Base Classes/Items/Card";
import {BasePlayer} from "../../../CardService/Base Classes/Items/Player";

describe("Test the Base Player's functionality", function() {
	var player;
    beforeEach(function() {
    	player = new BasePlayer("Bob", new BaseHand([
            new BaseCard(Suit.Spades, Value.Ace),
            new BaseCard(Suit.Hearts, Value.Ten),
            new BaseCard(Suit.Diamonds, Value.Queen),
            new BaseCard(Suit.Clubs, Value.King)
        ]));
    });
    it("equals another player with the same name", function () {
        var other = new BasePlayer("Bob", new BaseHand([]));
        expect(player.equalsOther(other)).toBe(true);
    });
    it("is not equal to another player with a different name", function () {
        var other = new BasePlayer("Bob Pfeffer", new BaseHand([]));
        expect(player.equalsOther(other)).toBe(false);
    });
});