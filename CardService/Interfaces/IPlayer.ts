/// <reference path="../Base Classes/Items/card.ts" />

import {BaseCard as Card} from "../Base Classes/Items/card";

export interface PlayerActions {
    playCard(card: Card): boolean;
}

