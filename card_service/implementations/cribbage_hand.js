var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var hand_1 = require("../base_classes/collections/hand");
var card_1 = require("../base_classes/items/card");
var card_game_1 = require("../base_classes/card_game");
"use strict";
var RunLength = (function () {
    function RunLength(runs, length) {
        this.numRuns = runs;
        this.runLength = length;
    }
    return RunLength;
})();
var CribbageHand = (function (_super) {
    __extends(CribbageHand, _super);
    function CribbageHand(cards) {
        _super.call(this, cards);
    }
    CribbageHand.prototype.countPoints = function (cutCard, mustHaveFiveCardFlush) {
        var points = 0;
        this.takeCard(cutCard);
        points = (2 * this.countFifteens());
        points += this.countPairs();
        var runLength = this.countRuns();
        if (runLength.runLength >= 3) {
            points += (runLength.runLength * runLength.numRuns);
        }
        if (this.indexOfItem(new card_1.BaseCard(card_1.Suit.Spades, card_1.Value.Jack)) != -1) {
            points++;
        }
        var numInFlush = this.countFlush();
        if (numInFlush >= (mustHaveFiveCardFlush ? 5 : 4)) {
            points += numInFlush;
        }
        return points;
    };
    CribbageHand.getCardValue = function (value) {
        if (value > 10) {
            return 10;
        }
        else {
            return value;
        }
    };
    CribbageHand.prototype.findDuplicates = function (hand) {
        hand.sortCards();
        var duplicates = new Array();
        for (var index = hand.size() - 1; index >= 0; index--) {
            var card = hand.itemAt(index);
            for (var subIx = index - 1; subIx >= 0; subIx--) {
                var subCard = hand.itemAt(subIx);
                if (subCard.value == card.value) {
                    duplicates.push(subCard);
                    hand.playCard(subCard);
                    index--;
                }
            }
        }
        return duplicates;
    };
    CribbageHand.prototype.countPairs = function () {
        var hand = this.makeCopy();
        var duplicates = this.findDuplicates(hand);
        var points = 0;
        for (var ix = 0; ix < duplicates.length; ix++) {
            var dup = duplicates[ix];
            var matches = 1;
            for (var subIx = ix + 1; subIx < duplicates.length; subIx++) {
                if (duplicates[subIx].value == dup.value) {
                    matches++;
                    duplicates.splice(subIx, 1);
                }
            }
            points += (matches == 1 ? 2 : matches == 2 ? 6 : 12);
        }
        return points;
    };
    CribbageHand.prototype.countRuns = function () {
        var hand = this.makeCopy();
        var duplicates = this.findDuplicates(hand);
        hand.sortCards();
        var longestRun = new Array();
        (function findLongestRun(aHand) {
            if (aHand.size() >= 3) {
                aHand.sortCards();
                var counter = 0;
                var subLongestCards = [aHand.itemAt(counter++), aHand.itemAt(counter++), aHand.itemAt(counter++)];
                var subLongest = [subLongestCards[0].value, subLongestCards[1].value, subLongestCards[2].value];
                var isSequential = card_game_1.Sequence.isSequentialAscending(subLongest);
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
    };
    CribbageHand.prototype.countFlush = function () {
        var hearts = 0, spades = 0, diamonds = 0, clubs = 0;
        for (var index = 0; index < this.size(); index++) {
            var suit = this.itemAt(index).suit;
            switch (suit) {
                case card_1.Suit.Clubs:
                    clubs++;
                    break;
                case card_1.Suit.Diamonds:
                    diamonds++;
                    break;
                case card_1.Suit.Hearts:
                    hearts++;
                    break;
                case card_1.Suit.Spades:
                    spades++;
                    break;
            }
        }
        return Math.max.apply(Math, [hearts, spades, diamonds, clubs]);
    };
    CribbageHand.prototype.makeCopy = function () {
        var cards = new Array();
        for (var index = 0; index < this.size(); index++) {
            var card = this.itemAt(index);
            cards.push(new card_1.BaseCard(card.suit, card.value));
        }
        return new CribbageHand(cards);
    };
    CribbageHand.prototype.countFifteens = function () {
        return this.countMatches(0, this.makeCopy());
    };
    CribbageHand.prototype.countMatches = function (value, hand) {
        var matches = 0;
        var match = (15 - value);
        hand.sortCards();
        for (var index = hand.size() - 1; index >= 0; index--) {
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
    };
    return CribbageHand;
})(hand_1.BaseHand);
exports.CribbageHand = CribbageHand;
//# sourceMappingURL=cribbage_hand.js.map