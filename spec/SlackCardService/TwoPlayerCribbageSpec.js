var Card_1 = require("../../CardService/Base Classes/Items/Card");
var Hand_1 = require("../../CardService/Base Classes/Collections/Hand");
var CribbagePlayer_1 = require("../../CardService/Implementations/CribbagePlayer");
var Cribbage_1 = require("../../CardService/Implementations/Cribbage");
var CardGame_1 = require("../../CardService/Base Classes/CardGame");
var CribbageHand_1 = require("../../CardService/Implementations/CribbageHand");
var ItemCollection_1 = require("../../CardService/Base Classes/Collections/ItemCollection");
"use strict";
describe("Test a Cribbage game between two players", function () {
    var game, playerOne, playerTwo;
    beforeEach(function () {
        playerOne = new CribbagePlayer_1.CribbagePlayer("Alice", new CribbageHand_1.CribbageHand([]));
        playerTwo = new CribbagePlayer_1.CribbagePlayer("Bob", new CribbageHand_1.CribbageHand([]));
        game = new Cribbage_1.Cribbage(new CardGame_1.Players([playerOne, playerTwo]));
        game.initializeGame();
    });
    it("doesn't allow duplicate players", function () {
        expect(function () { game.addPlayer(playerOne); }).toThrow(Cribbage_1.CribbageErrorStrings.PLAYER_ALREADY_IN_GAME);
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
    it("sets the next dealer correctly", function () {
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
    it("sets the next player in the sequence correctly", function () {
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
    function copyHand(cards) {
        var copy = [];
        for (var index = 0; index < cards.length; index++) {
            var card = cards[index];
            copy.push(new Card_1.BaseCard(card.suit, card.value));
        }
        return new Hand_1.BaseHand(copy);
    }
    function handsAreDistinct(handOne, handTwo) {
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
        expect(function () { game.playCard(playerTwo.name); }).toThrow(Cribbage_1.CribbageErrorStrings.KITTY_NOT_READY);
    });
    describe("Test with fixed hands, starting at 0 points", function () {
        var sevenOfSpades, sevenOfDiamonds, eightOfHearts, eightOfSpades, nineOfDiamonds, tenOfClubs, nineOfHearts, tenOfDiamonds, jackOfSpades, queenOfHearts, kingOfClubs, kingOfHearts;
        beforeEach(function () {
            sevenOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Seven);
            sevenOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Seven);
            eightOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Eight);
            eightOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Eight);
            nineOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Nine);
            tenOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Ten);
            playerOne.hand =
                new CribbageHand_1.CribbageHand([sevenOfSpades, sevenOfDiamonds, eightOfHearts, eightOfSpades, nineOfDiamonds, tenOfClubs]);
            nineOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Nine);
            tenOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Ten);
            jackOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Jack);
            queenOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Queen);
            kingOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.King);
            kingOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.King);
            playerTwo.hand =
                new CribbageHand_1.CribbageHand([nineOfHearts, tenOfDiamonds, jackOfSpades, queenOfHearts, kingOfClubs, kingOfHearts]);
            game.dealer = playerOne;
            game.nextPlayerInSequence = playerTwo;
            game.giveToKitty(playerOne, new ItemCollection_1.ItemCollection([nineOfDiamonds, tenOfClubs]));
            game.giveToKitty(playerTwo, new ItemCollection_1.ItemCollection([kingOfClubs, kingOfHearts]));
            game.cut = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.King);
        });
        it("takes cards from the players hands when they give to the kitty", function () {
            expect(playerOne.hand.size()).toEqual(4);
            expect(playerTwo.hand.size()).toEqual(4);
            expect(game.kitty.size()).toEqual(4);
        });
        it("doesn't let a player play a card they don't have", function () {
            expect(function () { game.playCard(playerTwo.name, tenOfClubs); }).toThrow(Cribbage_1.CribbageErrorStrings.PLAYER_DOESNT_HAVE_CARD);
        });
        it("ensures players play in order", function () {
            expect(function () { game.playCard(playerOne.name, sevenOfSpades); }).toThrow(Cribbage_1.CribbageErrorStrings.FMT_NOT_NEXT_PLAYER + playerTwo.name);
        });
        it("knows how to count points in round 2", function () {
            expect(playerOne.countPoints(game.cut)).toEqual(12);
            expect(playerTwo.countPoints(game.cut)).toEqual(6);
            expect(game.kitty.countPoints(game.cut, true)).toEqual(6);
        });
        describe("Test playing cards", function () {
            beforeEach(function () {
                game.playCard(playerTwo.name, queenOfHearts);
                game.playCard(playerOne.name, eightOfSpades);
                game.playCard(playerTwo.name, nineOfHearts);
            });
            it("does not allow exceeding 31", function () {
                expect(function () { game.playCard(playerOne.name, sevenOfSpades); }).toThrow(Cribbage_1.CribbageErrorStrings.EXCEEDS_31);
            });
            it("adds to the sequence", function () {
                expect(game.sequence.cards.countItems()).toEqual(3);
            });
            it("knows when the game is over", function () {
                game.teams.findTeam(playerOne).addPoints(playerOne, 119);
                expect(playerOne.hand.takeCard(new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Ace))).toBe(true);
            });
        });
    });
    describe("Test the run-of-play", function () {
        var SeqVal = (function () {
            function SeqVal(sequence, expectedValue) {
                this.sequence = sequence;
                this.expectedValue = expectedValue;
            }
            SeqVal.prototype.toString = function () {
                var text = '';
                for (var index = 0; index < this.sequence.cards.countItems(); index++) {
                    text += this.sequence.cards.itemAt(index).toString() + ', ';
                }
                if (text.length > 0) {
                    text = text.substring(0, text.length - 2);
                }
                return text;
            };
            SeqVal.prototype.countPoints = function () {
                return this.sequence.countPoints();
            };
            SeqVal.makeSequence = function (cards) {
                var seq = new CardGame_1.Sequence();
                seq.addCards(cards);
                return seq;
            };
            SeqVal.getAllPermutations = function (sequence) {
                var permutations = new Array();
                function permute(input, memo) {
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
                    var newSeq = new CardGame_1.Sequence();
                    newSeq.addCards(permutations[ix]);
                    ret.push(newSeq);
                }
                return ret;
            };
            return SeqVal;
        })();
        var fourOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Four), fourOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Four), fourOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Four), fourOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Four), fiveOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Five), fiveOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Five), fiveOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Five), fiveOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Five), sixOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Six), sixOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Six), sixOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Six), sixOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Six), sevenOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Seven), sevenOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Seven), sevenOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Seven), sevenOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Seven), eightOfHearts = new Card_1.BaseCard(Card_1.Suit.Hearts, Card_1.Value.Eight), eightOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Eight), eightOfClubs = new Card_1.BaseCard(Card_1.Suit.Clubs, Card_1.Value.Eight), eightOfDiamonds = new Card_1.BaseCard(Card_1.Suit.Diamonds, Card_1.Value.Eight), jackOfSpades = new Card_1.BaseCard(Card_1.Suit.Spades, Card_1.Value.Jack);
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
//# sourceMappingURL=TwoPlayerCribbageSpec.js.map