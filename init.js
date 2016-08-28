/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/26
 * Time: 23:18
 */
var fs = require('fs');
var async = require("async");
var Jimp = require("jimp");
var ColorThief = require('color-thief-jimp');


var AVT_DIR = 'public/images/avatars/';
var characters = JSON.parse(fs.readFileSync('public/json/character.json', 'utf8'));

//console.log(characters["l"])

async.each(Object.keys(characters), function(chara, callback) {
    Jimp.read(AVT_DIR+chara+'.png').then(function(image) {
        var dominantColor = ColorThief.getColor(image);
        characters[chara]["color"] = dominantColor;
        callback();
    }).catch(function (err) {
        console.error('Init character failed:' + chara);
        characters[chara] = null;
    });
}, function(err) {
    if( err ) {
        throw 'Read Images Error';
    } else {
        console.log('All characters have been inited successfully');
    }
});



module.exports = characters;