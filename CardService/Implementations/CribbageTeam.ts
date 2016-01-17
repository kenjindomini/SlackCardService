/// <reference path="../Base Classes/Collections/ItemCollection.ts" />
/// <reference path="CribbagePlayer.ts" />
/// <reference path="../Base Classes/Collections/Team.ts" />

import {ItemCollection} from "../Base Classes/Collections/ItemCollection";
import {CribbagePlayer} from "./CribbagePlayer";
import {BaseTeam} from "../Base Classes/Collections/Team";

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
