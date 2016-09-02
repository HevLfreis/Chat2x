/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/30
 * Time: 12:12
 */
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new winston.transports.Console(),
        new (winston.transports.File)({
            filename: 'logs/chat2x.log',
            timestamp: function() {
                return new Date().toISOString();
            },
            formatter: function(options) {
                return '[' + options.timestamp() +'] '+ options.level.toUpperCase() +': '+ (undefined !== options.message ? options.message : '') +
                    (options.meta && Object.keys(options.meta).length ? '\n\t'+ JSON.stringify(options.meta) : '' );
            },
            json: false
        })
    ]
});

module.exports = logger;