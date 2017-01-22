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
var characters = require('./characters.js');

module.exports = Socket;


function Socket(srv) {

    var io = socket(srv);

    // use express-session as socket session (connect.sid)
    io.use(function(socket, next) {
        session(socket.request, socket.request.res, next);
    });

    // online: online list { sessionid: [characterid, expires, ipaddr]... }
    // session2socket: fix the multiple page of same session
    const online = {}, session2socket = {};
    cleanDeadSession(online);

    io.on('connection', function(socket) {

        var req = socket.request,
            sess = req.session,
            ipaddr = util.req2ip(req),
            store = req.sessionStore,
            sid = sess.id,
            admin = false,
            cookies = {},
            skid = socket.id.slice(2);

        // maybe no cookie
        if (typeof socket.handshake.headers['cookie'] == 'string') {
            cookies = cookie.parse(socket.handshake.headers['cookie']);
        }

        // admin check
        var pass = socket.handshake.query.pass;
        if (pass && /^12345678.*/.test(pass)) {
            admin = true;
        }

        if (sid in session2socket) {
            if (!_.contains(session2socket[sid], skid)) {
                session2socket[sid].push(skid);
            }
        }
        else {
            session2socket[sid] = [skid];
        }

        // join to the default room
        var room = 'default room';
        socket.join(room);

        // broadcast all the online cids ONLY to the new client
        var infos = _.map(online, function(info, sid) {
            return { cid: info[0], color: characters[info[0]]['color']}
        });
        socket.emit('info', infos);
        socket.emit('chat', { t: 'sysnotice'});

        // sample a random cid to the user
        // if there's no cid to use, use 'a'(Friend A)
        // if session/cookie existed, keep the cid to forbid refreshing for a new one
        var cid = 'a';

        if (sid in online) {
            cid = online[sid][0];
            logger.info(formatter('reconnect', req, cid));
        }
        else if (admin) {
            cid = pass.split('$')[1];
            cid = (cid != '' && cid in characters && (!_.contains(_.map(online, function(info, sid) {
                return info[0];
            }), cid))) ? cid : 'admin';
            logger.info(formatter('admin', req, cid));
        }
        else {

            // map cid to a list
            var onlineIndex = _.map(online, function(info, sid) {
                return info[0];
            });

            // reject cid already online, exclude admin
            var scid =
                _.sample(
                    _.shuffle(
                        _.reject(Object.keys(characters), function(k) {
                            //if (_.contains(onlineIndex, k)) console.log('have: ',k);
                            if (k == 'admin') return true;
                            else return _.contains(onlineIndex, k);

            })), 1)[0];

            if (scid !== undefined) cid = scid;
            logger.info(formatter('connect', req, cid));
        }

        var cname = characters[cid]['name'];
        socket.emit('name', cname);

        // forbid multiple sysin msg
        if (!(sid in online)) {
            io.to(room).emit('chat', { name: cname, t: 'sysin'});
        }
        io.to(room).emit('info', [{ cid: cid, color: characters[cid]['color']}]);
        online[sid] = [cid, null, ipaddr];

        // emit active num to all clients
        io.to(room).emit('active', Object.keys(online).length);


        socket.on('chat', function(msg){

            //console.log(cid, msg);
            if (msg === '') {
                msg = characters[cid]['remark'];
            }
            else if (admin && msg.lastIndexOf('admin$', 0) === 0) {
                var warn = msg.split('$')[1].trim();
                if (_.contains(Object.keys(characters), warn)) {
                    io.to(room).emit('chat', { name: characters[warn]['name'], t: 'syswarn'});
                }

                return;
            }
            else {

                msg = msg.slice(0, 140);

                // save msg to db
                var history = new Message({
                    sid: sid,
                    cid: cid,
                    ipaddr: ipaddr,
                    room: room,
                    msg: msg,
                    timestamp: Date.now()
                });
                history.save();
            }

            // emit the msg to all clients
            io.to(room).emit('chat', { cid: cid, name: cname, msg: msg, t: ''});
        });


        // at message
        socket.on('at', function(ats){
            var cid2socket = {};
            _.each(online, function(info, sid) {
                cid2socket[info[0]] = session2socket[sid];
            });
            _.each(_.uniq(ats), function(at) {
                // Todo: wrong at some socket no exception ???
                if (at !== cid) {
                    io.to("/#" + cid2socket[at]).emit('at', cname);
                }
            });
        });

        // Todo: fix
        socket.on('disconnect', function() {
            // if the connection doesn't contains cookie
            // meaning the client connect to room without a http request
            // or the cookie expired

            if ('connect.sid' in cookies) {
                var expires = sess.cookie._expires;
                //console.log(new Date(), expires);
                if (Date.now() >= expires) {
                    delete online[sid];
                    logger.info(formatter('disconnect', req, cid));
                    io.to(room).emit('chat', { name: cname, t: 'sysout'});
                }
                else {
                    // if the cookie not expired, we keep the sid for
                    // client to avoid refreshing for a new cid
                    online[sid] = [cid, expires, ipaddr];
                    logger.info(formatter('keepalive', req, cid));
                }
            }
            else {
                delete online[sid];
                logger.info(formatter('disconnect', req, cid));
                io.to(room).emit('chat', { name: cname, t: 'sysout'});
            }

            // when a session is disconnected
            // we should disable all the sockets which share
            // the sessionid.
            if (sid in session2socket) {
                io.to(room).emit('offline', session2socket[sid]);
                delete session2socket[sid];
            }

            // emit active num to all clients
            io.to(room).emit('active', Object.keys(online).length);

        });
    });
    return io;
}

function formatter(act, req, cid) {
    return util.formatter(act, req)+' [CID: '+cid+']'
}

function cleanDeadSession(online) {
    setInterval(function() {
        _.each(online, function(info, sid) {
            if (info[1] !== null) {
                if (Date.now() > info[1]) {
                    console.log('clean: ', sid);
                    delete online[sid];
                }
            }
        });
    }, 1000 * 30)
}