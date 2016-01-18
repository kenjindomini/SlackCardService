/// <reference path="../Base Classes/Items/card.ts" />

import {BaseCard} from "../Base Classes/Items/card";

export interface DeckActions {
    shuffle(): void;
    draw(): BaseCard;
    randomDraw(withReplacement: boolean): BaseCard;
    toString(): string;
}
