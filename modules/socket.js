/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/30
 * Time: 10:22
 */
var socket = require('socket.io');
var session = require('./backend');
var _ = require('underscore');
var characters = require('../modules/characters.js');

module.exports = Socket;

// Todo: Socket.IO Authentication, sessionid

function Socket(srv) {
    var io = socket(srv);

    io.use(function(socket, next) {
        session(socket.request, socket.request.res, next);
    });

    var online = {};

    io.on('connection', function(socket){
        var sid = socket.request.session.id;
        console.log('socket: ', sid);

        var room = 'default room';
        socket.join(room);

        var info = _.map(online, function(cid, sid) {
            return { cid: cid, color: characters[cid]['color']}
        });

        socket.emit('info', info);

        var cid = 'a', cname = 'Friend A';
        if (sid in online) {
            cid = online[sid];
        }
        else {
            // Todo: no cid to use
            scid = _.sample(_.reject(Object.keys(characters), function(k) {
                return _.contains(online, k)
            }), 1)[0];

            if (scid !== undefined) cid = scid;
        }

        cname = characters[cid]['name'];
        //online.push(cid);
        online[socket.request.session.id] = cid;
        io.to(room).emit('chat', { name: cname, t: 'sysin'});
        io.to(room).emit('info', [{ cid: cid, color: characters[cid]['color']}]);
        console.log(online);

        socket.on('chat', function(msg){
            console.log(cname, msg);
            if (msg === '') msg = characters[cid]['remark'];
            io.to(room).emit('chat', { cid: cid, name: cname, msg: msg, t:''});
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
            delete online[socket.request.session.id];
            io.to(room).emit('chat', { name: cname, t: 'sysout'});

        });
    });
    return io;
}
