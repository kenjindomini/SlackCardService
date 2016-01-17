/// <reference path="../Base Classes/Items/Card.ts" />
/// <reference path="../Base Classes/Items/Player.ts" />
/// <reference path="../Base Classes/Collections/ItemCollection.ts" />
/// <reference path="../Base Classes/CardGame.ts" />
/// <reference path="CribbageHand.ts" />

import {BaseCard as Card} from "../Base Classes/Items/Card";
import {BasePlayer as Player} from "../Base Classes/Items/Player";
import {ItemCollection} from "../Base Classes/Collections/ItemCollection";
import {BaseCardGame as CardGame} from "../Base Classes/CardGame";
import {CribbageHand} from "./CribbageHand";

"use strict";

class PlayedCards extends ItemCollection<Card> {
    constructor(cards: Array<Card>) {
        super(cards);
    }
    removeAll(): void {
        this.items.splice(0, this.items.length);
    }
    addCard(card: Card) {
        this.items.push(card);
    }
}

export class CribbagePlayer extends Player {
    points: number;
    played: PlayedCards;
    constructor(name: string, hand: CribbageHand) {
        super(name, hand);
        this.points = 0;
        this.played = new PlayedCards([]);
    }
    addPoints(points: number) {
        this.points += points;
    }
    playCard(card: Card) {
        var played = super.playCard(card);
        if (played) {
            // The card was removed from our hand, so add it to the list of played cards
            this.played.addCard(card);
        }
        return played;
    }
    takeCard(card: Card) {
        return this.hand.takeCard(card);
    }
    canPlay(count: number) {
        var canPlay = false;
        for (var index = 0; index < this.hand.countItems(); index++) {
            if (this.hand.itemAt(index).value + count <= 31) {
                canPlay = true;
                break;
            }
        }
        return canPlay;
    }
    resetCards() {
        this.hand = new CribbageHand([]);
        this.played.removeAll();
    }
    countPoints(cutCard: Card) {
        var cribHand = new CribbageHand(this.hand.items);
        return cribHand.countPoints(cutCard, false);
    }
}
