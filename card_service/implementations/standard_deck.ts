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
        for (var ixSuit = 0; ixSuit < suitNames.length; ixSuit++) {
            // Start ixVal at 1 to adjust for the enum being 1-based
            for (var ixVal = 1; ixVal < cardNames.length + 1; ixVal++) {
                cards.push(new BaseCard(ixSuit, ixVal));
            }
        }
        super(cards);
    }
}
