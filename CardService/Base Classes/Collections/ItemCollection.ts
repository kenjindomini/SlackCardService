/// <reference path="../../Interfaces/IItem.ts" />

import {IItem} from "../../Interfaces/IItem";

"use strict";
export class ItemCollection<ItemType extends IItem> {
    items: Array<ItemType>;

    constructor(items: Array<ItemType>) {
        this.items = items;
    }
    indexOfItem(item: ItemType) {
        var index = -1;
        for(var ix = 0; ix < this.items.length; ix++) {
            if (item.equalsOther(this.items[ix])) {
                index = ix;
                break;
            }
        }
        return index;
    }
    countItems() {
        return this.items.length;
    }
    insertItem(item: ItemType, index: number) {
        this.items.splice(index, 0, item);
    }
    addItem(item: ItemType) {
        this.items.push(item);
    }
    addItems(items: Array<ItemType>) {
        this.items.concat(items);
    }
    removeItem(item: ItemType) {
        var index = this.indexOfItem(item);
        var hasCard = (index != -1);
        if (hasCard) {
            this.items.splice(index, 1);
        }
        return hasCard;
    }
    removeAll() {
        this.items.splice(0, this.items.length);
    }
    itemAt(index: number) {
        if (index < 0 || index > this.items.length) {
            throw "Index out of bounds!";
        }
        return this.items[index];
    }
}
