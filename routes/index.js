var express = require('express');
var router = express.Router();
var logger = require('../modules/logger');
var util = require('../modules/util');

/* GET home page. */
router.get('/', function(req, res, next) {
    logger.info(util.formatter('access', req));
    res.render('room', { title: 'Chat2x' });
    console.log(req.session.id);
});

router.get('/2', function(req, res, next) {
    res.render('room2', { title: 'Chat2x' });
});

module.exports = router;
