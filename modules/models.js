/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/29
 * Time: 14:28
 */
var mongoose = require('mongoose');

var historySchema = mongoose.Schema({
    sid: String,
    chara: String,
    room: Number,
    msg: String,
    time: Date
});

var History = mongoose.model('History', historySchema);

module.exports = History;