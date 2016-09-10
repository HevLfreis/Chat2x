/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/9/5
 * Time: 12:44
 */
var schedule = require('node-schedule');
var logger = require('../modules/logger');

var weekDayRuleStart = new schedule.RecurrenceRule();
weekDayRuleStart.dayOfWeek = [0, new schedule.Range(0, 4)];
weekDayRuleStart.hour = 18;
weekDayRuleStart.minute = 30;

var weekDayRuleEnd = new schedule.RecurrenceRule();
weekDayRuleEnd.dayOfWeek = [0, new schedule.Range(0, 4)];
weekDayRuleEnd.hour = 23;
weekDayRuleEnd.minute = 35;

var weekEndRuleStart = new schedule.RecurrenceRule();
weekEndRuleStart.dayOfWeek = [0, new schedule.Range(5, 6)];
weekEndRuleStart.hour = 17;
weekEndRuleStart.minute = 10;

var weekEndRuleEnd = new schedule.RecurrenceRule();
weekEndRuleEnd.dayOfWeek = [0, new schedule.Range(5, 6)];
weekEndRuleEnd.hour = 23;
weekEndRuleEnd.minute = 59;


var schedTheWorld = function(page) {
    var sd = schedule.scheduleJob(weekDayRuleStart, function(){
        logger.info('Chat2x Start');
        page.name = 'room'
    });
    var se = schedule.scheduleJob(weekEndRuleStart, function(){
        logger.info('Chat2x Start');
        page.name = 'room'
    });
    var ed = schedule.scheduleJob(weekDayRuleEnd, function(){
        console.log('Chat2x End');
        page.name = 'space'
    });
    var ee = schedule.scheduleJob(weekEndRuleEnd, function(){
        console.log('Chat2x End');
        page.name = 'space'
    });
};

module.exports = schedTheWorld;
