/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/29
 * Time: 14:28
 */
var mongoose = require('mongoose');

var msgSchema = mongoose.Schema({
    sid: String,
    cid: String,
    room: String,
    msg: String,
    time: Date
});

var Message = mongoose.model('Messages', msgSchema);

module.exports = Message;