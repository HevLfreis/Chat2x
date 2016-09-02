/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/26
 * Time: 23:18
 */
var fs = require('fs');
var async = require("async");
var Jimp = require("jimp");
var ColorThief = require('color-thief-jimp');
var assert = require('assert');

var dir = 'public/images/avatars/';
var characters = JSON.parse(fs.readFileSync('public/data/character.json', 'utf8'));

// Todo: callback hell
async.each(Object.keys(characters), function(cid, callback) {
    if (!characters[cid]["color"]) {
        Jimp.read(dir+cid+'.png').then(function(image) {
            characters[cid]["color"] = ColorThief.getColor(image);
            callback();
        }).catch(function (err) {
            console.error('Init character failed:' + cid);

            // Todo: deal with wrong pic
            delete characters[cid];
        });
    }

}, function(err) {
    if( err ) {
        throw 'Read Images Error';
    } else {
        console.log('All characters have been inited successfully');
    }
});

module.exports = characters;

