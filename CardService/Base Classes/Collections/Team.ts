/// <reference path="../Items/Player.ts" />
/// <reference path="../../Interfaces/IItem.ts" />
/// <reference path="ItemCollection.ts" />

import {ItemCollection} from "./ItemCollection";
import {BasePlayer as Player} from "../Items/Player";
import {IItem} from "../../Interfaces/IItem";

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
