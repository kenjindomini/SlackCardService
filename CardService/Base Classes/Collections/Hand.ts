/// <reference path="../../Interfaces/IHand.ts" />
/// <reference path="ItemCollection.ts" />
/// <reference path="../Items/Card.ts" />

import {ItemCollection} from "./ItemCollection";
import {BaseCard as Card} from "../Items/Card";
import {HandActions} from "../../Interfaces/IHand";

"use strict";

export class BaseHand extends ItemCollection<Card> implements HandActions {
    constructor(cards: Array<Card>) {
        super(cards);
    }
    playCard(card: Card) {
        var index = this.indexOfItem(card);
        var inHand = (index != -1);
        if (inHand) {
            this.items.splice(index, 1);
        }
        return inHand;
    }
    takeCard(card: Card) {
        var index = this.indexOfItem(card);
        var taken = (index == -1);
        if (taken) {
            this.items.push(card);
        }
        return taken;
    }
    sortCards() {
        this.items.sort(function(c1, c2) { return c1.value - c2.value; });
    }
    size() {
        return this.items.length;
    }
}
