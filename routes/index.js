var express = require('express');
var router = express.Router();
var moment = require('moment');
var logger = require('../modules/logger');
var characters = require('../modules/characters.js');
var sched = require('../modules/schedule.js');
var util = require('../modules/util');


var title = 'Chat2x | 次元聊天室';

var start = moment('18-30', 'H-m'),
    end = moment('23-35', 'H-m'),
    now = moment();

var page = (start<now&&now<end) ? { name: 'room' }:{ name: 'space' };
sched(page);


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
