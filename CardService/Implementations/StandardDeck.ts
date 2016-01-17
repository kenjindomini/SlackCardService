/// <reference path="../Base Classes/Collections/Deck.ts" />
/// <reference path="../Base Classes/Items/Card.ts" />

import {BaseDeck} from "../Base Classes/Collections/Deck";
import {BaseCard, EnumExt, Suit, Value} from "../Base Classes/Items/Card";

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
