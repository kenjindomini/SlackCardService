/// <reference path="../Base Classes/Collections/deck.ts" />
/// <reference path="../Base Classes/Items/card.ts" />

import {BaseDeck} from "../Base Classes/Collections/deck";
import {BaseCard, EnumExt, Suit, Value} from "../Base Classes/Items/card";

"use strict";

export class StandardDeck extends BaseDeck<BaseCard> {
    constructor() {
        // Create the 52-card deck
        var cards = new Array<BaseCard>();
        var suitNames = EnumExt.getNames(Suit);
        var cardNames = EnumExt.getNames(Value);
        for (var suit in suitNames) {
            for (var value in cardNames) {
                cards.push(new BaseCard(suit, value));
            }
        }
        super(cards);
    }
}
