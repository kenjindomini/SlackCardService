/// <reference path="../items/player.ts" />
/// <reference path="../../interfaces/iitem.ts" />
/// <reference path="item_collection.ts" />

import {ItemCollection} from "./item_collection";
import {BasePlayer as Player} from "../items/player";
import {IItem} from "../../interfaces/iitem";

"use strict";

export class BaseTeam<SomePlayerClass extends Player> extends ItemCollection<SomePlayerClass> implements IItem {
    id: number;
    constructor(id: number, players: Array<SomePlayerClass>) {
        super(players);
        this.id = id;
    }
    countPlayers():number {
        return this.countItems();
    }
    playerAt(index:number):SomePlayerClass {
        return this.itemAt(index);
    }
    hasPlayer(player: SomePlayerClass) {
        return (this.indexOfItem(player) != -1);
    }
    equalsOther(team: BaseTeam<SomePlayerClass>) {
        return this.id == team.id;
    }
}
