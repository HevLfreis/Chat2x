/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/30
 * Time: 10:22
 */
var app = require('../app');
var _ = require('underscore');
var socket = require('socket.io');
var session = require('./backend');
var Message = require('./models');
var cookie = require('cookie');
var logger = require('./logger');
var util = require('./util');
var characters = require('../modules/characters.js');

module.exports = Socket;

// Todo: Socket.IO Authentication, sessionid
function Socket(srv) {
    var io = socket(srv);

    // use express-session as socket session (connect.sid)
    io.use(function(socket, next) {
        session(socket.request, socket.request.res, next);
    });

    // online list { sessionid: [characterid, expires]... }
    const online = {};
    cleanDeadSession(online);

    io.on('connection', function(socket) {

        var req = socket.request,
            sess = req.session,
            store = req.sessionStore,
            sid = sess.id,
            cookies = cookie.parse(socket.handshake.headers['cookie']);

        // join to the default room
        var room = 'default room';
        socket.join(room);

        // broadcast all the online cids ONLY to the new client
        var infos = _.map(online, function(cid, sid) {
            return { cid: cid[0], color: characters[cid[0]]['color']}
        });
        socket.emit('info', infos);

        // sample a random cid to the user
        // if there's no cid to use, use 'a'(Friend A)
        // if session/cookie existed, keep the cid to forbid refreshing for a new one
        var cid = 'a';
        if (sid in online) {
            cid = online[sid][0];
            logger.info(formatter('reconnect', req, cid));
        }
        else {

            // map cid to a list
            var onlineIndex = _.map(online, function(cid, sid) {
                return cid[0];
            });
            // reject cid already online
            var scid = _.sample(_.reject(Object.keys(characters), function(k) {
                //if (_.contains(onlineIndex, k)) console.log('have: ',k);
                return _.contains(onlineIndex, k);
            }), 1)[0];

            if (scid !== undefined) cid = scid;
            logger.info(formatter('connect', req, cid));
        }

        var cname = characters[cid]['name'];
        online[sid] = [cid, null];
        io.to(room).emit('chat', { name: cname, t: 'sysin'});
        io.to(room).emit('info', [{ cid: cid, color: characters[cid]['color']}]);

        socket.on('chat', function(msg){

            console.log(cid, msg);

            if (msg === '') {
                msg = characters[cid]['remark'];
            }
            else {

                // save msg to db
                var histroy = new Message({
                    sid: sid,
                    cid: cid,
                    room: room,
                    msg: msg,
                    time: Date.now()
                });
                histroy.save(function(err, his) {
                    console.log(his.id);
                });
            }

            // emit the msg to all clients
            io.to(room).emit('chat', { cid: cid, name: cname, msg: msg, t: ''});
        });

        // Todo: fix
        socket.on('disconnect', function() {
            // if the connection doesn't contains cookie
            // meaning the client connect to room without a http request
            //
            if ('connect.sid' in cookies) {
                var expires = sess.cookie._expires;
                //console.log(new Date(), expires);
                if (new Date() >= expires) {
                    delete online[sid];
                    logger.info(formatter('disconnect', req, cid));
                    io.to(room).emit('chat', { name: cname, t: 'sysout'});
                }
                else {
                    online[sid] = [cid, expires];
                    logger.info(formatter('keepalive', req, cid));
                }
            }
            else {
                delete online[sid];
                logger.info(formatter('disconnect', req, cid));
                io.to(room).emit('chat', { name: cname, t: 'sysout'});
            }

            io.to(room).emit('chat', { name: cname, t: 'sysout'});

        });
    });
    return io;
}

function formatter(act, req, cid) {
    return util.formatter(act, req)+' [CID: '+cid+']'
}

function cleanDeadSession(online) {
    setInterval(function() {
        _.each(online, function(cid, sid) {
            if (cid[1] !== null) {
                if (Date.now() > cid[1]) {
                    console.log('clean: ', sid);
                    delete online[sid];
                }
            }
        });

        console.log(online);
    }, 5000)
}
