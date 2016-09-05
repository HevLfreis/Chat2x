/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/9/5
 * Time: 12:44
 */
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(0, 6)];
rule.hour = 12;
rule.minute = 53;

var j = schedule.scheduleJob(rule, function(){
    console.log('The world is going to end today.');
});

module.exports = j;
