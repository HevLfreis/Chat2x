/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/9/5
 * Time: 12:44
 */
var schedule = require('node-schedule');
var logger = require('../modules/logger');

var ruleStart = new schedule.RecurrenceRule();
ruleStart.hour = 18;
ruleStart.minute = 30;

var ruleEnd = new schedule.RecurrenceRule();
ruleEnd.hour = 23;
ruleEnd.minute = 35;


var schedTheWorld = function(page) {
    var s = schedule.scheduleJob(ruleStart, function(){
        logger.info('Chat2x Start');
        page.name = 'room'
    });
    var e = schedule.scheduleJob(ruleEnd, function(){
        console.log('Chat2x End');
        page.name = 'space'
    });
};

module.exports = schedTheWorld;
