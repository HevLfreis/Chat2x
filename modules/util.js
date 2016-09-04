/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/31
 * Time: 16:07
 */
var _ = require('underscore');

function reqLogFormatter(act, req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return act.toUpperCase()+' (' + _.last(ip.split(':')) + ')' + req.sessionID;
}

//var TrieFilter = {
//    key: '',
//    dict: TrieFilter
//};

module.exports = {formatter: reqLogFormatter};