"use strict";
var BasePlayer = (function () {
    function BasePlayer(name, hand) {
        this.name = name;
        this.hand = hand;
    }
    BasePlayer.prototype.playCard = function (card) {
        return this.hand.playCard(card);
    };
    BasePlayer.prototype.numCards = function () {
        return this.hand.size();
    };
    BasePlayer.prototype.equalsOther = function (player) {
        return (this.name == player.name);
    };
    return BasePlayer;
})();
exports.BasePlayer = BasePlayer;
//# sourceMappingURL=player.js.map