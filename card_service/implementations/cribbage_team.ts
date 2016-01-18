/// <reference path="../base_classes/collections/item_collection.ts" />
/// <reference path="cribbage_player.ts" />
/// <reference path="../base_classes/collections/team.ts" />

import {ItemCollection} from "../base_classes/collections/item_collection";
import {CribbagePlayer} from "./cribbage_player";
import {BaseTeam} from "../base_classes/collections/team";

"use strict";

export class CribbageTeamErrorStrings {
    static PLAYER_NOT_ON_TEAM: string = "Player not on this team!";
}
export class CribbageTeam extends BaseTeam<CribbagePlayer> {
    constructor(id: number, players: Array<CribbagePlayer>) {
        super(id, players);
    }
    countPoints() {
        var points = 0;
        for (var index in this.items) {
            points += this.items[index].points;
        }
        return points;
    }

    /**
     * Add points to the given player.
     * @param player
     * @param points
     * @returns {boolean} true if it's game over
     */
    addPoints(player: CribbagePlayer, points: number):boolean {
        var index = this.indexOfItem(player);
        if (index == -1) {
            throw CribbageTeamErrorStrings.PLAYER_NOT_ON_TEAM;
        }
        this.items[index].addPoints(points);
        return (this.countPoints() > 120);
    }
    hasPlayer(player: CribbagePlayer):boolean {
        return (this.indexOfItem(player) != -1);
    }
    numPlayers():number {
        return this.countItems();
    }
}
