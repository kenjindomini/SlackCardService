/// <reference path="../Base Classes/Items/Card.ts" />

import {BaseCard as Card} from "../Base Classes/Items/Card";

export interface PlayerActions {
    playCard(card: Card): boolean;
}

