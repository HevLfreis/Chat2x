var express = require('express');
var router = express.Router();
var moment = require('moment');
var logger = require('../modules/logger');
var characters = require('../modules/characters.js');
var sched = require('../modules/schedule.js');
var util = require('../modules/util');


var start = moment('18-30', 'H-m'),
    end = moment('23-35', 'H-m'),
    now = moment();

var page = (start<now&&now<end) ? { name: 'room' }:{ name: 'space' };
sched(page);


/* GET home page. */
router.get('/', function(req, res, next) {
    logger.info(util.formatter('access', req));
    res.render(page.name, { title: 'Chat2x' });
});

router.get('/bingo', function(req, res, next) {
    res.render('bingo', { title: 'Chat2x' });
});

router.get('/admin', function(req, res, next) {
    res.render('room', { title: 'Chat2x', admin: true });
});

router.get('/list', function(req, res, next) {
    res.send(characters);
});

module.exports = router;
