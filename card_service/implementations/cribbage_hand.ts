/// <reference path="../base_classes/collections/hand.ts" />
/// <reference path="../base_classes/items/card.ts" />

import {BaseHand} from "../base_classes/collections/hand";
import {BaseCard as Card, Suit, Value} from "../base_classes/items/card";
import {Sequence} from "../base_classes/card_game";

"use strict";

class RunLength {
    numRuns: number;
    runLength: number;
    constructor(runs: number, length: number) {
        this.numRuns = runs;
        this.runLength = length;
    }
}

export class CribbageHand extends BaseHand {
    constructor(cards: Array<Card>) {
        super(cards);
    }
    countPoints(cutCard: Card, mustHaveFiveCardFlush: boolean) {
        var points = 0;
        // Count 15s
        this.takeCard(cutCard);
        points = (2 * this.countFifteens());
        // Count pairs
        points += this.countPairs();
        // Count runs
        var runLength = this.countRuns();
        if (runLength.runLength >= 3) {
            points += (runLength.runLength * runLength.numRuns);
        }
        // Count the right jack
        if (this.indexOfItem(new Card(Suit.Spades, Value.Jack)) != -1) {
            points++;
        }
        // Count flush
        var numInFlush = this.countFlush();
        if (numInFlush >= (mustHaveFiveCardFlush ? 5 : 4)) {
            points += numInFlush;
        }
        return points;
    }
    static getCardValue(value: number) {
        if (value > 10) {
            return 10;
        }
        else {
            return value;
        }
    }
    private findDuplicates(hand: CribbageHand): Array<Card> {
        hand.sortCards();
        var duplicates = new Array<Card>();
        for (var index = hand.size() - 1; index >= 0; index--) {
            var card = hand.itemAt(index);
            for (var subIx = index-1; subIx >= 0; subIx--) {
                var subCard = hand.itemAt(subIx);
                if (subCard.value == card.value) {
                    duplicates.push(subCard);
                    hand.playCard(subCard);
                    index--;
                }
            }
        }
        return duplicates;
    }
    private countPairs(): number {
        var hand = this.makeCopy();
        var duplicates = this.findDuplicates(hand);
        var points = 0;
        for (var ix = 0; ix < duplicates.length; ix++) {
            var dup = duplicates[ix];
            var matches = 1; // It had to match at least once to be a duplicate
            for (var subIx = ix + 1; subIx < duplicates.length; subIx++) {
                if (duplicates[subIx].value == dup.value) {
                    matches++;
                    duplicates.splice(subIx, 1);
                }
            }
            points += (matches == 1 ? 2 : matches == 2 ? 6 : 12);
        }
        return points;
    }
    private countRuns(): RunLength {
        // Separate out the duplicates
        var hand = this.makeCopy();
        var duplicates = this.findDuplicates(hand);
        // Check for a run - if there is, then see if the duplicates can be used for additional runs
        hand.sortCards();
        var longestRun = new Array<Card>();
        (function findLongestRun(aHand: CribbageHand) {
            if (aHand.size() >= 3) {
                aHand.sortCards();
                var counter = 0;
                var subLongestCards = [aHand.itemAt(counter++), aHand.itemAt(counter++), aHand.itemAt(counter++)];
                var subLongest = [subLongestCards[0].value, subLongestCards[1].value, subLongestCards[2].value];
                var isSequential = Sequence.isSequentialAscending(subLongest);
                if (isSequential) {
                    while (isSequential) {
                        if (counter < aHand.size()) {
                            subLongestCards.push(aHand.itemAt(counter));
                            subLongest.push(subLongestCards[counter++].value);
                        }
                        else {
                            break;
                        }
                    }
                    if (subLongestCards.length > longestRun.length) {
                        longestRun = subLongestCards;
                    }
                }
                aHand.playCard(aHand.itemAt(0));
                findLongestRun(aHand);
            }
        })(hand);
        var runLength = new RunLength(0, 0);
        if (longestRun.length >= 3) {
            // Check for how many runs there are
            runLength.runLength = longestRun.length;
            runLength.numRuns = 1;
            for (var dupIx = 0; dupIx < duplicates.length; dupIx++) {
                var dup = duplicates[dupIx];
                for (var runIx = 0; runIx < longestRun.length; runIx++) {
                    var runCard = longestRun[runIx];
                    if (runCard.value == dup.value) {
                        runLength.numRuns++;
                    }
                }
            }
        }
        return runLength;
    }
    private countFlush(): number {
        var hearts = 0, spades = 0, diamonds = 0, clubs = 0;
        for (var index = 0; index < this.size(); index++) {
            var suit = this.itemAt(index).suit;
            switch (suit) {
                case Suit.Clubs: clubs++; break;
                case Suit.Diamonds: diamonds++; break;
                case Suit.Hearts: hearts++; break;
                case Suit.Spades: spades++; break;
            }
        }
        return Math.max.apply(Math, [hearts, spades, diamonds, clubs]);
    }
    private makeCopy(): CribbageHand {
        var cards = new Array<Card>();
        for (var index = 0; index < this.size(); index++) {
            var card = this.itemAt(index);
            cards.push(new Card(card.suit, card.value));
        }
        return new CribbageHand(cards);
    }
    private countFifteens(): number {
        return this.countMatches(0, this.makeCopy());
    }
    private countMatches(value: number, hand: CribbageHand): number {
        var matches = 0;
        var match = (15-value);
        hand.sortCards();
        for (var index = hand.size()-1; index >= 0; index--) {
            var card = hand.itemAt(index);
            var cardValue = card.value;
            if (cardValue == match) {
                matches++;
            }
        }
        if (hand.size() > 1) {
            var next = hand.itemAt(0);
            hand.playCard(next);
            matches += this.countMatches(next.value, hand);
        }
        return matches;
    }
}
