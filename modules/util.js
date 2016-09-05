/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/31
 * Time: 16:07
 */
var _ = require('underscore');

function reqLogFormatter(act, req) {
    return act.toUpperCase()+' (' + req2ip(req) + ')' + req.sessionID;
}

function req2ip(req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return _.last(ip.split(':'));
}

//var TrieFilter = {
//    key: '',
//    dict: TrieFilter
//};

module.exports = {
    formatter: reqLogFormatter,
    req2ip: req2ip
};