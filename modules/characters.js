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
var characters = JSON.parse(fs.readFileSync('public/json/character.json', 'utf8'));

async.each(Object.keys(characters), function(cid, callback) {
    Jimp.read(dir+cid+'.png').then(function(image) {
        characters[cid]["color"] = ColorThief.getColor(image);
        callback();
    }).catch(function (err) {
        console.error('Init character failed:' + cid);
        characters[cid] = null;
    });
}, function(err) {
    if( err ) {
        throw 'Read Images Error';
    } else {
        console.log('All characters have been inited successfully');
    }
});

module.exports = characters;