var express = require('express');
var router = express.Router();
var hello = require('../modules/characters.js');
h = hello;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('room', { title: 'Chat2x' });
});

router.get('/history', function (req, res, next) {

    // Todo: not all character
    res.send(h);
});

router.get('/2', function(req, res, next) {
    res.render('room2', { title: 'Chat2x' });
});

module.exports = router;
