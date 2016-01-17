/// <reference path="../Base Classes/Items/Card.ts" />

import {BaseCard as Card} from "../Base Classes/Items/Card";

export interface HandActions {
    /**
     * Play the given card by removing it from the hand
     * @param card
     * @returns true if the card was played
     */
    playCard(card: Card): boolean;
    /**
     * Take the given card, but only if it's not already in the hand
     * @param card
     * @returns true if the card was taken
     */
    takeCard(card: Card): boolean;
}
