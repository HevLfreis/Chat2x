var express = require('express');
var router = express.Router();
var logger = require('../modules/logger');
var characters = require('../modules/characters.js');
var util = require('../modules/util');

/* GET home page. */
router.get('/', function(req, res, next) {

    logger.info(util.formatter('access', req));
    res.render('room', { title: 'Chat2x' });
    console.log(req.session.id);
});

router.get('/bingo', function(req, res, next) {
    res.render('bingo', { title: 'Chat2x' });
});

router.get('/list', function(req, res, next) {
    res.send(characters);
});

module.exports = router;
