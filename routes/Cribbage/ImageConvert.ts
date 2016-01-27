/// <reference path="../../typings/tsd.d.ts" />

import request = require("request");
import fs = require("fs");
import Promise = require("promise");
//if (process.env.NODE_ENV != "Production")
    //require('promise/lib/rejection-tracking').enable();
// SB TODO: write typescript definition file
import images = require("images");
import {CribbageHand} from "../../card_service/implementations/cribbage_hand";
import {BaseCard as Card} from "../../card_service/base_classes/items/card";

export module ImageConvert {
    export function getCardImageUrl(card:Card, deckType:string="Default"): string {
        var cardUrlStr = card.toUrlString();
        // Capitalize the first letter and add ".png"
        var ret = `${process.env.AWS_S3_STANDARD_DECK_URL}${deckType}/${cardUrlStr}`;
        console.log(ret);
        return ret;
    }

    var download = function(uri:string, filename:string, callback:any){
        request.head(uri, function(err, res, body){
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

    function downloadCard(card:Card, cardsPath:string): Promise<string> {
        if (cardsPath.indexOf("/", cardsPath.length - 1) == -1)
            cardsPath = cardsPath.concat("/");
        var promise = new Promise(function(resolve, reject) {
            var cardFilePath = `${cardsPath}${card.toUrlString()}`;
            if (fs.exists(cardFilePath)) {
                // Resolve right away, no need to download again
                resolve(cardFilePath);
            }
            else {
                // Download the card
                download(getCardImageUrl(card), cardFilePath, function () {
                    resolve(cardFilePath);
                });
            }
        });
        return promise;
    }

    export function makeHandImage(hand:CribbageHand, player:string, cardsPath:string):Promise<string> {
        var promise = new Promise(function(resolve, reject) {
            var playerHandPath = "";
            if (cardsPath.indexOf("/", cardsPath.length - 1) == -1)
                cardsPath = cardsPath.concat("/");
            hand.sortCards();
            var promises:Array<Promise<string>> = [];
            for (var ix = 0; ix < hand.size(); ix++) {
                // Download all the cards asynchronously
                promises.push(downloadCard(hand.itemAt(ix), cardsPath));
            }
            Promise.all(promises).then(function (values) {
                // Merge together all the downloaded images
                playerHandPath = `${cardsPath}${player}.png`;
                var width = 0, maxHeight = 0;
                for (var jx = 0; jx < values.length; jx++) {
                    var cardFilePath = values[jx];
                    width += images(cardFilePath).width();
                    var height = images(cardFilePath).height();
                    if (height > maxHeight) {
                        maxHeight = height;
                    }
                }
                var playerHandImage = images(width, maxHeight);
                var xOffset = 0;
                width = 0;
                for (var kx = 0; kx < values.length; kx++) {
                    var cardFilePath = values[kx];
                    width += images(cardFilePath).width();
                    playerHandImage = playerHandImage.draw(images(cardFilePath), xOffset, 0);
                    xOffset = width;
                }
                try { playerHandImage.size(width, maxHeight).save(playerHandPath); }
                catch (e) { reject(e); }
                resolve(playerHandPath);
            });
        });
        return promise;
    }
}