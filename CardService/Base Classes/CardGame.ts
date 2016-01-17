/// <reference path="Items/Card.ts" />
/// <reference path="Items/Player.ts" />
/// <reference path="Collections/Team.ts" />
/// <reference path="Collections/Deck.ts" />
/// <reference path="Collections/ItemCollection.ts" />

import {BaseCard as Card} from "./Items/Card";
import {BasePlayer as Player} from "./Items/Player";
import {BaseTeam as Team} from "./Collections/Team";
import {BaseDeck as Deck} from "./Collections/Deck";
import {ItemCollection} from "./Collections/ItemCollection";

"use strict";

export class Players<SomePlayerClass extends Player> extends ItemCollection<SomePlayerClass> {
    constructor(players: Array<SomePlayerClass>) {
        super(players);
    }
    addPlayer(player: SomePlayerClass) {
        this.addItem(player);
    }
    findPlayer(playerName: string) {
        var player = null;
        for (var index = 0; index < this.countItems(); index++) {
            var tmp = this.itemAt(index);
            if (tmp.name == playerName) {
                player = tmp;
                break;
            }
        }
        return player;
    }
}

export class Teams<SomePlayerClass extends Player> {
    teams: ItemCollection<Team<SomePlayerClass>>;
    constructor(teams: ItemCollection<Team<SomePlayerClass>>) {
        this.teams = teams;
    }
    findTeam(player: SomePlayerClass) {
        var team = null;
        var hasPlayer = false;
        for (var ix = 0; ix < this.teams.countItems(); ix++) {
            hasPlayer = this.teams.itemAt(ix).hasPlayer(player);
            if (hasPlayer) {
                team = this.teams.itemAt(ix);
                break;
            }
        }
        return team;
    }
    removeAll() {
        this.teams.removeAll();
    }
    addTeam(team: Team<SomePlayerClass>) {
        this.teams.addItem(team);
    }
    numTeams() {
        return this.teams.countItems();
    }
}

export class Sequence {
    cards: ItemCollection<Card>;
    constructor() {
        this.cards = new ItemCollection<Card>([]);
    }
    addCard(card: Card) {
        var index = this.cards.indexOfItem(card);
        // Assert index == -1
        if (index != -1) {
            throw "Attempting to add a card that's already in the sequence!";
        }
        this.cards.addItem(card);
        return this.countPoints();
    }
    addCards(cards: Array<Card>) {
        for (var index = 0; index < cards.length; index++) {
            this.addCard(cards[index]);
        }
    }
    countPoints() {
        return this.findLongestReverseSequence() + this.countOfAKind();
    }
    removeAll() {
        this.cards.removeAll();
    }
    toString() {
        var ret = '';
        for (var ix = 0; ix < this.cards.countItems(); ix++) {
            ret += (this.cards.itemAt(ix).value + ', ');
        }
        ret = ret.slice(0, ret.length - 2);
        return ret;
    }
    static isSequentialAscending(array: Array<number>) {
        if (array.length < 3) {
            return true;
        }
        var sequential = true;
        var last = -1;
        array.sort((n1, n2) => { return n1 - n2; });
        for (var ix = 0; ix < array.length; ix++) {
            if (last == -1) {
                last = array[ix];
                continue;
            }
            var next = array[ix];
            if (last != (next-1)) {
                sequential = false;
                break;
            }
            last = next;
        }
        return sequential;

    }
    private findLongestReverseSequence() {
        var numItems = this.cards.countItems();
        if (numItems < 3) {
            return 0;
        }
        // Start at the back, sort the values, if there is a numerical run of 3 or more, then it is a run
        var values = [];
        var longest = 0;
        for (var ix = numItems - 1; ix >= 0; ix--) {
            values.push(this.cards.itemAt(ix).value);
            if (Sequence.isSequentialAscending(values)) {
                longest = values.length;
            }
        }
        return (longest >= 3 ? longest : 0);
    }
    private countOfAKind() {
        var matches = 0;
        var index = (this.cards.countItems() - 1);
        var match = this.cards.itemAt(index);
        index--;
        for (index; index >= 0; index--) {
            if (this.cards.itemAt(index).value == match.value) {
                matches++;
            }
            else {
                break;
            }
        }
        return (matches == 1 ? 2 : matches == 2 ? 6 : matches == 3 ? 12 : 0);
    }
}

export class BaseCardGame<SomePlayerClass extends Player, SomeDeckClass extends Deck<Card>> {
    players: Players<SomePlayerClass>;
    teams: Teams<SomePlayerClass>;
    name: string;
    deck: SomeDeckClass;
    constructor(players: Players<SomePlayerClass>, teams: Teams<SomePlayerClass>, name: string, deck: SomeDeckClass) {
        this.players = players; this.teams = teams; this.name = name; this.deck = deck;
    }
    shuffle() {
        this.deck.shuffle();
    }
}
