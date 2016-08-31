/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/31
 * Time: 16:07
 */
var _ = require('underscore');

function reqLogFormatter(act, req) {
    return act.toUpperCase()+' (' + _.last(req.ip.split(':')) + ')' + req.sessionID;
}

module.exports = {formatter: reqLogFormatter};