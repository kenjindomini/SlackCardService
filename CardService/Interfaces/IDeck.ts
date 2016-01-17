/// <reference path="../Base Classes/Items/Card.ts" />

import {BaseCard} from "../Base Classes/Items/Card";

export interface DeckActions {
    shuffle(): void;
    draw(): BaseCard;
    randomDraw(withReplacement: boolean): BaseCard;
    toString(): string;
}
