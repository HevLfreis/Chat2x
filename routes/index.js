var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('room', { title: 'Chat2x' });
});

router.get('/2', function(req, res, next) {
  res.render('room2', { title: 'Chat2x' });
});

module.exports = router;
