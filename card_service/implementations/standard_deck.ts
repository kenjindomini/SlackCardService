/// <reference path="../base_classes/collections/deck.ts" />
/// <reference path="../base_classes/items/card.ts" />

import {BaseDeck} from "../base_classes/collections/deck";
import {BaseCard, EnumExt, Suit, Value} from "../base_classes/items/card";

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
