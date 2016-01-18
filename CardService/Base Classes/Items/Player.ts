/// <reference path="../../Interfaces/iplayer.ts" />
/// <reference path="../../Interfaces/iitem.ts" />
/// <reference path="card.ts" />
/// <reference path="../Collections/hand.ts" />

import {PlayerActions} from "../../Interfaces/iplayer";
import {IItem} from "../../Interfaces/iitem";
import {BaseCard as Card} from "./card";
import {BaseHand as Hand} from "../Collections/hand";

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
