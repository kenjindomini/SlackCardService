var item_collection_1 = require("../../CardService/Base Classes/Collections/item_collection");
var BasicItem = (function () {
    function BasicItem(value) {
        this.value = value;
    }
    BasicItem.prototype.equalsOther = function (other) {
        return (this.value == other.value);
    };
    return BasicItem;
})();
describe("Test the ItemCollection functionality", function () {
    var collection;
    beforeEach(function () {
        collection = new item_collection_1.ItemCollection([
            new BasicItem(1),
            new BasicItem(2)
        ]);
    });
    it("can find an item's index", function () {
        expect(collection.indexOfItem(new BasicItem(1)) != -1).toBe(true);
        expect(collection.indexOfItem(new BasicItem(3)) == -1).toBe(true);
    });
    it("can add and remove items", function () {
        expect(collection.countItems()).toEqual(2);
        var newItem = new BasicItem(3);
        collection.addItem(newItem);
        expect(collection.countItems()).toEqual(3);
        expect(collection.removeItem(new BasicItem(4))).toBe(false);
        expect(collection.countItems()).toEqual(3);
        expect(collection.removeItem(newItem)).toBe(true);
        expect(collection.countItems()).toEqual(2);
    });
});
//# sourceMappingURL=ItemCollectionSpec.js.map