var express = require('express');
var router = express.Router();
var logger = require('../modules/logger');
var characters = require('../modules/characters.js');
var sched = require('../modules/schedule.js');
var util = require('../modules/util');

// Todo: fix this
// change page based on schedule
var page = { name: 'room' };
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
