/// <reference path="../../Interfaces/IPlayer.ts" />
/// <reference path="../../Interfaces/IItem.ts" />
/// <reference path="Card.ts" />
/// <reference path="../Collections/Hand.ts" />

import {PlayerActions} from "../../Interfaces/IPlayer";
import {IItem} from "../../Interfaces/IItem";
import {BaseCard as Card} from "./Card";
import {BaseHand as Hand} from "../Collections/Hand";

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
