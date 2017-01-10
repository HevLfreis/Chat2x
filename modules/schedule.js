/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/9/5
 * Time: 12:44
 */
var schedule = require('node-schedule');
var logger = require('../modules/logger');

var ruleStart = new schedule.RecurrenceRule();
ruleStart.hour = 17;
ruleStart.minute = 30;
ruleStart.dayOfWeek = [new schedule.Range(0, 5)];

var ruleEnd = new schedule.RecurrenceRule();
ruleEnd.hour = 23;
ruleEnd.minute = 35;
ruleStart.dayOfWeek = [new schedule.Range(0, 5)];

var satStart = new schedule.RecurrenceRule();
satStart.hour = 6;
satStart.minute = 30;
satStart.dayOfWeek = 6;

var satEnd = new schedule.RecurrenceRule();
satEnd.hour = 23;
satEnd.minute = 59;
satEnd.dayOfWeek = 6;


var schedTheWorld = function(page) {
    var s = schedule.scheduleJob(ruleStart, function(){
        logger.info('Chat2x Start');
        page.name = 'room'
    });
    var e = schedule.scheduleJob(ruleEnd, function(){
        logger.info('Chat2x End');
        page.name = 'space'
    });
    var ss = schedule.scheduleJob(satStart, function(){
        logger.info('Chat2x Start');
        page.name = 'room'
    });
    var se = schedule.scheduleJob(satEnd, function(){
        logger.info('Chat2x End');
        page.name = 'space'
    });
};

module.exports = schedTheWorld;
