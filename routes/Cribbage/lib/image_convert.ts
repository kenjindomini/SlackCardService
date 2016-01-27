/// <reference path="../../../typings/tsd.d.ts" />

import request = require("request");
import fs = require("fs");
import Promise = require("promise");
// SB TODO: write typescript definition file
import images = require("images");
import {CribbageHand} from "../../../card_service/implementations/cribbage_hand";
import {BaseCard as Card} from "../../../card_service/base_classes/items/card";

export module ImageConvert {
    export function getCardImageUrl(card:Card, deckType:string="Default"): string {
        var cardUrlStr = card.toUrlString();
        return `${process.env.AWS_S3_STANDARD_DECK_URL}${deckType}/${cardUrlStr}`;
    }

    var download = function(uri:string, filename:string, callback:any){
        console.log(`Downloading from ${uri}`);
        request.head(uri, function(err, res, body){
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);
            console.log(`about to create stream ${filename}`);
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
        });
    };

    function downloadCard(card:Card, cardsPath:string): Promise {
        return new Promise(function(resolve, reject) {
            var cardFilePath = `${cardsPath}${card.toUrlString()}`;
            if (fs.exists(cardFilePath)) {
                // Resolve right away, no need to download again
                resolve(cardFilePath);
            }
            else {
                // Download the card
                console.log(`Downloading the ${card.toString()}`);
                download(getCardImageUrl(card), cardFilePath, function () {
                    console.log(`Resolving to ${cardFilePath}`);
                    resolve(cardFilePath);
                });
            }
        });
    }

    export function makeHandImage(hand:CribbageHand, player:string, cardsPath:string):Promise {
        return new Promise(function(resolve, reject) {
            var playerHandPath = "";
            if (cardsPath.indexOf("/", cardsPath.length - 1) == -1)
                cardsPath = cardsPath.concat("/");
            if (!fs.existsSync(cardsPath)) {
                fs.mkdirSync(cardsPath);
            }
            hand.sortCards();
            var promises:Array<Promise> = [];
            console.log("Begin downloading Cards");
            for (var ix = 0; ix < hand.size(); ix++) {
                // Download all the cards asynchronously
                promises.push(downloadCard(hand.itemAt(ix), cardsPath));
            }
            Promise.all(promises).then(function (values) {
                console.log("Begin Merging Cards");
                // Merge together all the downloaded images
                playerHandPath = `${cardsPath}${player}.png`;
                console.log(`Merging the hand into ${playerHandPath}`);
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
                    var filePath = values[kx];
                    width += images(filePath).width();
                    playerHandImage = playerHandImage.draw(images(filePath), xOffset, 0);
                    xOffset = width;
                }
                try { playerHandImage.size(width, maxHeight).save(playerHandPath); }
                catch (e) { reject(e); }
                resolve(playerHandPath);
            });
        });
    }
}
