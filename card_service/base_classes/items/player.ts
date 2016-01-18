/// <reference path="../../interfaces/iplayer.ts" />
/// <reference path="../../interfaces/iitem.ts" />
/// <reference path="card.ts" />
/// <reference path="../collections/hand.ts" />

import {PlayerActions} from "../../interfaces/iplayer";
import {IItem} from "../../interfaces/iitem";
import {BaseCard as Card} from "./card";
import {BaseHand as Hand} from "../collections/hand";

"use strict";

export class BasePlayer implements PlayerActions, IItem {
    name: string;
    hand: Hand;
    constructor(name: string, hand: Hand) {
        this.name = name;
        this.hand = hand;
    }
    playCard(card: Card) {
        return this.hand.playCard(card);
    }
    numCards() {
        return this.hand.size();
    }
    equalsOther(player: BasePlayer) {
        return (this.name == player.name);
    }
}
