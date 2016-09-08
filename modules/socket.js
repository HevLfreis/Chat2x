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

// Todo: Socket.IO Authentication, sessionid
// Todo: multiple same page, disconnect one , others ?
// Todo: date.now and new date()
// Todo: admin enter
// Todo: nginx pass limit
function Socket(srv) {

    var io = socket(srv);

    // use express-session as socket session (connect.sid)
    io.use(function(socket, next) {
        session(socket.request, socket.request.res, next);
    });

    // online: online list { sessionid: [characterid, expires, ipaddr]... }
    // socket2session: fix the multiple page of same session
    const online = {}, socket2session = {}, blacklist = [];
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

        // disable ip in blacklist
        //if (_.contains(blacklist, ipaddr)) {
        //    console.log("ban")
        //    socket.disconnect();
        //    return;
        //}

        // maybe no cookie
        if (typeof socket.handshake.headers['cookie'] == 'string') {
            cookies = cookie.parse(socket.handshake.headers['cookie']);
        }

        // admin check
        if (socket.handshake.query.pass === "12345678") {
            admin = true;
        }

        if (sid in socket2session) {
            if (!_.contains(socket2session[sid], skid)) {
                socket2session[sid].push(skid);
            }
        }
        else {
            socket2session[sid] = [skid];
        }

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
        else if (admin) {
            cid = 'admin';
            logger.info(formatter('admin', req, cid));
        }
        else {

            // map cid to a list
            var onlineIndex = _.shuffle(_.map(online, function(cid, sid) {
                return cid[0];
            }));

            // reject cid already online, exclude admin
            var scid = _.sample(_.reject(Object.keys(characters), function(k) {
                //if (_.contains(onlineIndex, k)) console.log('have: ',k);
                if (k == 'admin') return true;
                else return _.contains(onlineIndex, k);

            }), 1)[0];

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
            //else if (admin && msg.lastIndexOf('ban:$', 0) === 0) {
            //    var bcid = msg.slice(5);
            //    blacklist.push(bcid);
            //
            //    console.log(blacklist, bcid2ip(online, bcid));
            //}
            else {

                msg = msg.slice(0, 140);

                // save msg to db
                var histroy = new Message({
                    sid: sid,
                    cid: cid,
                    room: room,
                    msg: msg,
                    time: Date.now()
                });
                histroy.save();
            }

            // emit the msg to all clients
            io.to(room).emit('chat', { cid: cid, name: cname, msg: msg, t: ''});
        });

        // Todo: fix
        socket.on('disconnect', function() {
            // if the connection doesn't contains cookie
            // meaning the client connect to room without a http request
            // or the cookie expired

            if ('connect.sid' in cookies) {
                var expires = sess.cookie._expires;
                //console.log(new Date(), expires);
                if (new Date() >= expires) {
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

            // when a session is disconnect
            // we should disable all the sockets which share
            // the sessionid.
            if (sid in socket2session) {
                io.to(room).emit('offline', socket2session[sid]);
                delete socket2session[sid];
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
        _.each(online, function(cid, sid) {
            if (cid[1] !== null) {
                if (Date.now() > cid[1]) {
                    console.log('clean: ', sid);
                    delete online[sid];
                }
            }
        });
        //console.log("online: ", online);
        console.log("online: "+Object.keys(online).length);
    }, 1000 * 30)
}

//function bcid2ip(online, bcid) {
//    var ip = null;
//    _.each(online, function(cid, sid) {
//        if (cid[0] == bcid) ip = cid[2];
//    });
//    return ip;
//}
