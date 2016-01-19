/// <reference path="../../typings/jasmine/jasmine.d.ts" />
/// <reference path="../../card_service/base_classes/collections/hand.ts" />
/// <reference path="../../card_service/implementations/cribbage_player.ts" />
/// <reference path="../../card_service/implementations/cribbage_team.ts" />
/// <reference path="../../card_service/implementations/cribbage.ts" />
/// <reference path="../../card_service/base_classes/card_game.ts" />

import {BaseCard, Suit, Value} from "../../card_service/base_classes/items/card";
import {BaseHand} from "../../card_service/base_classes/collections/hand";
import {CribbagePlayer} from "../../card_service/implementations/cribbage_player";
import {CribbageTeam} from "../../card_service/implementations/cribbage_team";
import {Cribbage, CribbageErrorStrings} from "../../card_service/implementations/cribbage";
import {BaseCardGame, Players, Sequence} from "../../card_service/base_classes/card_game";
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";
import {ItemCollection} from "../../card_service/base_classes/collections/item_collection";

"use strict";

describe("Test a Cribbage game between two players", function() {
	var game, playerOne, playerTwo;
    beforeEach(function() {
        playerOne = new CribbagePlayer("Alice", new CribbageHand([]));
        playerTwo = new CribbagePlayer("Bob", new CribbageHand([]));
        game = new Cribbage(new Players<CribbagePlayer>([playerOne, playerTwo]));
        game.initializeGame();
    });
    it("doesn't allow duplicate players", function() {
       expect(function() { game.addPlayer(playerOne); }).toThrow(CribbageErrorStrings.PLAYER_ALREADY_IN_GAME);
    });
    it("cuts a random dealer", function () {
        var sameDealerEveryTime = true;
        var lastDealer = null;
        for (var ix = 0; ix < 1000; ix++) {
            game.cutForDealer();
            if (lastDealer == null) {
                lastDealer = game.dealer;
            }
            else if (!lastDealer.equalsOther(game.dealer)) {
                sameDealerEveryTime = false;
                break;
            }
        }
        expect(sameDealerEveryTime).toBe(false);
    });
    it("sets the next dealer correctly", function() {
        game.dealer = playerOne;
        game.nextPlayerInSequence = playerTwo;
        game.setNextDealer();
        expect(game.dealer.equalsOther(playerTwo)).toBe(true);
        expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
        game.setNextDealer();
        expect(game.dealer.equalsOther(playerOne)).toBe(true);
        expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
        game.setNextDealer();
        expect(game.dealer.equalsOther(playerTwo)).toBe(true);
        expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
    });
    it("sets the next player in the sequence correctly", function() {
        expect(game.nextPlayerInOrder(playerOne).equalsOther(playerTwo)).toBe(true);
        expect(game.nextPlayerInOrder(playerTwo).equalsOther(playerOne)).toBe(true);
    });
    it("deals the right number of cards and assigns a dealer", function () {
        expect(game.dealer).toBeNull();
        expect(game.players.itemAt(0).numCards()).toEqual(0);
        expect(game.players.itemAt(1).numCards()).toEqual(0);
        game.cutForDealer();
        expect(game.dealer).toBeDefined();
        expect(game.nextPlayerInSequence).toBeDefined();
        game.deal();
        expect(game.players.itemAt(0).numCards()).toEqual(6);
        expect(game.players.itemAt(1).numCards()).toEqual(6);
    });
    function copyHand(cards: Array<BaseCard>) {
        var copy = [];
        for (var index = 0; index < cards.length; index++) {
            var card = cards[index];
            copy.push(new BaseCard(card.suit, card.value));
        }
        return new BaseHand(copy);
    }
    function handsAreDistinct(handOne: BaseHand, handTwo: BaseHand) {
        var areDistinct = false;
        for (var h1Ix = 0; h1Ix < handOne.countItems(); h1Ix++) {
            var cardOne = handOne.itemAt(h1Ix);
            var hasMatch = false;
            for (var h2Ix = 0; h2Ix < handTwo.countItems(); h2Ix++) {
                var cardTwo = handTwo.itemAt(h2Ix);
                if (cardOne.equalsOther(cardTwo)) {
                    hasMatch = true;
                    break;
                }
            }
            if (!hasMatch) {
                areDistinct = true;
                break;
            }
        }
        return areDistinct;
    }
    it("deals random cards each time", function () {
        game.cutForDealer();
        game.deal();
        var handOne = copyHand(game.players.itemAt(0).hand.items);
        var handTwo = copyHand(game.players.itemAt(1).hand.items);
        game.deal();
        var handOneAgain = copyHand(game.players.itemAt(0).hand.items);
        var handTwoAgain = copyHand(game.players.itemAt(1).hand.items);
        expect(handsAreDistinct(handOne, handOneAgain)).toBe(true);
        expect(handsAreDistinct(handTwo, handTwoAgain)).toBe(true);
    });
    it("waits for the kitty to be full before letting players play", function () {
        expect(function() { game.playCard(playerTwo.name); }).toThrow(CribbageErrorStrings.KITTY_NOT_READY);
    });
    var sevenOfSpades = new BaseCard(Suit.Spades, Value.Seven),
        sevenOfDiamonds = new BaseCard(Suit.Diamonds, Value.Seven),
        eightOfHearts = new BaseCard(Suit.Hearts, Value.Eight),
        eightOfSpades = new BaseCard(Suit.Spades, Value.Eight),
        nineOfDiamonds = new BaseCard(Suit.Diamonds, Value.Nine),
        tenOfClubs = new BaseCard(Suit.Clubs, Value.Ten),
        nineOfHearts = new BaseCard(Suit.Hearts, Value.Nine),
        tenOfDiamonds = new BaseCard(Suit.Diamonds, Value.Ten),
        jackOfSpades = new BaseCard(Suit.Spades, Value.Jack),
        queenOfHearts = new BaseCard(Suit.Hearts, Value.Queen),
        kingOfClubs = new BaseCard(Suit.Clubs, Value.King),
        kingOfHearts = new BaseCard(Suit.Hearts, Value.King);
    describe("Test with fixed hands, starting at 0 points", function() {
        beforeEach(function () {
            playerOne.hand =
                new CribbageHand([sevenOfSpades, sevenOfDiamonds, eightOfHearts, eightOfSpades, nineOfDiamonds, tenOfClubs]);
            playerTwo.hand =
                new CribbageHand([nineOfHearts, tenOfDiamonds, jackOfSpades, queenOfHearts, kingOfClubs, kingOfHearts]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(playerOne, new ItemCollection<BaseCard>([nineOfDiamonds, tenOfClubs]));
            game.giveToKitty(playerTwo, new ItemCollection<BaseCard>([kingOfClubs, kingOfHearts]));
            game.cut = new BaseCard(Suit.Spades, Value.King);
        });
        it("takes cards from the players hands when they give to the kitty", function () {
            expect(playerOne.hand.size()).toEqual(4);
            expect(playerTwo.hand.size()).toEqual(4);
            expect(game.kitty.size()).toEqual(4);
        });
        it("doesn't let a player play a card they don't have", function () {
            expect(function() { game.playCard(playerTwo.name, tenOfClubs); }).toThrow(CribbageErrorStrings.PLAYER_DOESNT_HAVE_CARD);
        });
        it("ensures players play in order", function () {
            expect(function() { game.playCard(playerOne.name, sevenOfSpades); }).toThrow(CribbageErrorStrings.FMT_NOT_NEXT_PLAYER + playerTwo.name);
        });
        it("knows how to count points in round 2", function () {
            expect(playerOne.countPoints(game.cut)).toEqual(12);
            expect(playerTwo.countPoints(game.cut)).toEqual(6);
            expect(game.kitty.countPoints(game.cut, true)).toEqual(6);
        });
        describe("Test playing cards", function() {
            beforeEach(function() {
                game.playCard(playerTwo.name, queenOfHearts);
                game.playCard(playerOne.name, eightOfSpades);
                game.playCard(playerTwo.name, nineOfHearts);
            });
            it("does not allow exceeding 31", function () {
                expect(function() { game.playCard(playerOne.name, sevenOfSpades); }).toThrow(CribbageErrorStrings.EXCEEDS_31);
            });
            it("adds to the sequence", function () {
                expect(game.sequence.cards.countItems()).toEqual(3);
            });
            it("knows when the game is over", function () {
                game.teams.findTeam(playerOne).addPoints(playerOne, 119);
                expect(playerOne.hand.takeCard(new BaseCard(Suit.Spades, Value.Ace))).toBe(true);
            });
        });
    });
    describe("Test an entire round of play", function () {
        beforeEach(function () {
            playerOne.hand =
                new CribbageHand([sevenOfSpades, sevenOfDiamonds, eightOfHearts, eightOfSpades, nineOfDiamonds, tenOfClubs]);
            playerTwo.hand =
                new CribbageHand([nineOfHearts, tenOfDiamonds, jackOfSpades, queenOfHearts, kingOfClubs, kingOfHearts]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(playerOne, new ItemCollection<BaseCard>([sevenOfDiamonds, eightOfHearts]));
            game.giveToKitty(playerTwo, new ItemCollection<BaseCard>([kingOfClubs, kingOfHearts]));
            game.cut = new BaseCard(Suit.Spades, Value.King);
            game.playersInPlay.addItems(game.players.items);
        });
        it("knows how to play one round", function () {
            game.playCard(playerTwo.name, nineOfHearts);
            game.playCard(playerOne.name, nineOfDiamonds);
            expect(game.getTeam(0).countPoints()).toEqual(2); // Pair of nines
            game.playCard(playerTwo.name, jackOfSpades);
            game.go(playerOne.name);
            game.go(playerTwo.name);
            expect(game.getTeam(1).countPoints()).toEqual(1); // Point for the go
            expect(game.nextPlayerInSequence.equalsOther(playerOne)).toBe(true);
            game.playCard(playerOne.name, tenOfClubs);
            game.playCard(playerTwo.name, tenOfDiamonds);
            expect(game.getTeam(1).countPoints()).toEqual(3); // Two more points for a pair
            game.playCard(playerOne.name, eightOfSpades);
            game.go(playerTwo.name);
            game.go(playerOne.name);
            expect(game.getTeam(0).countPoints()).toEqual(3); // Point for a go
            expect(game.nextPlayerInSequence.equalsOther(playerTwo)).toBe(true);
            game.playCard(playerTwo.name, queenOfHearts);
            game.playCard(playerOne.name, sevenOfSpades);
            // The round is over
            expect(game.getTeam(0).countPoints()).toEqual(
                4 /* round of play */ + 6 /* their hand */ + 8 /* their kitty */
            );
            expect(game.getTeam(1).countPoints()).toEqual(
                3 /* round of play */ + 6 /* their hand */
            );
            expect(game.dealer.equalsOther(playerTwo)).toBe(true);
        });
    });
    describe("Test the run-of-play", function() {
        class SeqVal {
            sequence: Sequence;
            expectedValue: number;
            constructor(sequence: Sequence, expectedValue: number) {
                this.sequence = sequence;
                this.expectedValue = expectedValue;
            }
            toString() {
                var text = '';
                for (var index = 0; index < this.sequence.cards.countItems(); index++) {
                    text += this.sequence.cards.itemAt(index).toString() + ', ';
                }
                if (text.length > 0) {
                    // Remove the last comma + space
                    text = text.substring(0, text.length - 2);
                }
                return text;
            }
            countPoints() {
                return this.sequence.countPoints();
            }
            static makeSequence(cards: Array<BaseCard>) {
                var seq = new Sequence();
                seq.addCards(cards);
                return seq;
            }
            static getAllPermutations(sequence: Sequence) {
                var permutations = new Array<Array<BaseCard>>();
                function permute(input: Array<BaseCard>, memo?: any) {
                    var cur, memo = memo || [];
                    for (var i = 0; i < input.length; i++) {
                        cur = input.splice(i, 1);
                        if (input.length == 0) {
                            permutations.push(memo.concat(cur));
                        }
                        permute(input.slice(), memo.concat(cur));
                        input.splice(i, 0, cur[0]);
                    }
                    return permutations;
                }
                permute(sequence.cards.items);
                var ret = [];
                for (var ix = 0; ix < permutations.length; ix++) {
                    var newSeq = new Sequence();
                    newSeq.addCards(permutations[ix]);
                    ret.push(newSeq);
                }
                return ret;
            }
        }
        var fourOfHearts = new BaseCard(Suit.Hearts, Value.Four),
            fourOfSpades = new BaseCard(Suit.Spades, Value.Four),
            fourOfClubs = new BaseCard(Suit.Clubs, Value.Four),
            fourOfDiamonds = new BaseCard(Suit.Diamonds, Value.Four),
            fiveOfHearts = new BaseCard(Suit.Hearts, Value.Five),
            fiveOfSpades = new BaseCard(Suit.Spades, Value.Five),
            fiveOfClubs = new BaseCard(Suit.Clubs, Value.Five),
            fiveOfDiamonds = new BaseCard(Suit.Diamonds, Value.Five),
            sixOfHearts = new BaseCard(Suit.Hearts, Value.Six),
            sixOfSpades = new BaseCard(Suit.Spades, Value.Six),
            sixOfClubs = new BaseCard(Suit.Clubs, Value.Six),
            sixOfDiamonds = new BaseCard(Suit.Diamonds, Value.Six),
            sevenOfHearts = new BaseCard(Suit.Hearts, Value.Seven),
            sevenOfSpades = new BaseCard(Suit.Spades, Value.Seven),
            sevenOfClubs = new BaseCard(Suit.Clubs, Value.Seven),
            sevenOfDiamonds = new BaseCard(Suit.Diamonds, Value.Seven),
            eightOfHearts = new BaseCard(Suit.Hearts, Value.Eight),
            eightOfSpades = new BaseCard(Suit.Spades, Value.Eight),
            eightOfClubs = new BaseCard(Suit.Clubs, Value.Eight),
            eightOfDiamonds = new BaseCard(Suit.Diamonds, Value.Eight),
            jackOfSpades = new BaseCard(Suit.Spades, Value.Jack);
        describe("Test counting points in the run-of-play", function () {
            describe("knows how to count runs", function () {
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([sixOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(3);
                });
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([jackOfSpades, sixOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(3);
                });
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([fourOfClubs, jackOfSpades, sixOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(3);
                });
                it("is a run of zero", function () {
                    expect(SeqVal.makeSequence([fourOfClubs, sixOfHearts, jackOfSpades, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(0);
                });
                it("is a run of four", function () {
                    expect(SeqVal.makeSequence([sixOfHearts, eightOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(4);
                });
                it("is a run of four", function () {
                    expect(SeqVal.makeSequence([jackOfSpades, sixOfHearts, eightOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(4);
                });
                it("is a run of four", function () {
                    expect(SeqVal.makeSequence([fourOfHearts, jackOfSpades, sixOfHearts, eightOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(4);
                });
                it("is a run of four", function () {
                    expect(SeqVal.makeSequence([fourOfHearts, fourOfSpades, jackOfSpades, sixOfHearts, eightOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(4);
                });
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([fourOfHearts, fourOfSpades, eightOfHearts, jackOfSpades, sixOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(3);
                });
                it("is a run of zero", function () {
                    expect(SeqVal.makeSequence([fourOfHearts, fourOfSpades, sixOfHearts, eightOfHearts, jackOfSpades, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(0);
                });
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([fourOfHearts, fourOfSpades, eightOfHearts, jackOfSpades, sixOfHearts, fiveOfHearts, sevenOfHearts]).countPoints()).toEqual(3);
                });
                it("is a run of five", function () {
                    expect(SeqVal.makeSequence([fiveOfHearts, sevenOfHearts, fourOfHearts, sixOfHearts, eightOfHearts]).countPoints()).toEqual(5);
                });
                it("is a run of five", function () {
                    expect(SeqVal.makeSequence([jackOfSpades, fiveOfHearts, sevenOfHearts, fourOfHearts, sixOfHearts, eightOfHearts]).countPoints()).toEqual(5);
                });
                it("is a run of five", function () {
                    expect(SeqVal.makeSequence([fourOfClubs, jackOfSpades, fiveOfHearts, sevenOfHearts, fourOfHearts, sixOfHearts, eightOfHearts]).countPoints()).toEqual(5);
                });
                it("is a run of five", function () {
                    expect(SeqVal.makeSequence([fourOfDiamonds, fourOfClubs, jackOfSpades, fiveOfHearts, sevenOfHearts, fourOfHearts, sixOfHearts, eightOfHearts]).countPoints()).toEqual(5);
                });
                it("is a run of four", function () {
                    expect(SeqVal.makeSequence([fourOfDiamonds, fourOfClubs, eightOfHearts, jackOfSpades, sevenOfHearts, fiveOfHearts, fourOfHearts, sixOfHearts]).countPoints()).toEqual(4);
                });
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([fourOfDiamonds, fourOfClubs, eightOfHearts, sevenOfHearts, jackOfSpades, fiveOfHearts, fourOfHearts, sixOfHearts]).countPoints()).toEqual(3);
                });
                it("is a run of zero", function () {
                    expect(SeqVal.makeSequence([fourOfDiamonds, fourOfClubs, fiveOfHearts, sevenOfHearts, jackOfSpades, fourOfHearts, sixOfHearts, eightOfHearts]).countPoints()).toEqual(0);
                });
                it("is a run of three", function () {
                    expect(SeqVal.makeSequence([sixOfHearts, fourOfClubs, eightOfHearts, sevenOfClubs, sixOfDiamonds]).countPoints()).toEqual(3);
                });
                it("is a run of three, twice!", function () {
                    expect(SeqVal.makeSequence([sevenOfSpades, fiveOfHearts, sixOfDiamonds]).countPoints()).toEqual(3);
                    expect(SeqVal.makeSequence([sevenOfSpades, fiveOfHearts, sixOfDiamonds, fiveOfSpades, sevenOfHearts]).countPoints()).toEqual(3);
                });
            });
            it("knows how to count of-a-kinds", function () {
                var pair = new SeqVal(SeqVal.makeSequence([sevenOfSpades, sevenOfHearts]), 2);
                var threeOfAKind = new SeqVal(SeqVal.makeSequence([sevenOfSpades, sevenOfHearts, sevenOfClubs]), 6);
                var fourOfAKind = new SeqVal(SeqVal.makeSequence([sevenOfSpades, sevenOfHearts, sevenOfClubs, sevenOfDiamonds]), 12);
                expect(pair.countPoints()).toEqual(pair.expectedValue);
                expect(threeOfAKind.countPoints()).toEqual(threeOfAKind.expectedValue);
                expect(fourOfAKind.countPoints()).toEqual(fourOfAKind.expectedValue);
            });
        });
    });
});