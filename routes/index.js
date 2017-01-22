var express = require('express');
var router = express.Router();
var moment = require('moment');
var logger = require('../modules/logger');
var characters = require('../modules/characters.js');
var schedule = require('../modules/schedule.js');
var util = require('../modules/util');


var title = 'Chat2x | 次元聊天室';

var start = moment('17-30', 'H-m'),
    end = moment('23-35', 'H-m'),
    sats = moment('6-30', 'H-m'),
    sate = moment('23-59', 'H-m'),
    now = moment();

var page;
//if (now.weekday() != 6)
//     page = (start<now&&now<end) ? { name: 'room' }:{ name: 'space' };
//else
//     page = (sats<now&&now<sate) ? { name: 'room' }:{ name: 'space' };
//
//schedule(page);
page = { name: 'room' };

/* GET home page. */
router.get('/', function(req, res, next) {
    logger.info(util.formatter('access', req));
    res.render(page.name, { title: title });
});

router.get('/bingo', function(req, res, next) {
    res.render('bingo', { title: title });
});

router.get('/admin', function(req, res, next) {
    res.render('room', { title: title, admin: true });
});

router.get('/list', function(req, res, next) {
    res.send(characters);
});

module.exports = router;
