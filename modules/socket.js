/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/30
 * Time: 10:22
 */
var socket = require('socket.io');
var _ = require('underscore');
var characters = require('../modules/characters.js');

module.exports = Socket;

// Todo: Socket.IO Authentication, sessionid

function Socket(srv) {
    var io = socket(srv);
    var members = {};
    _.each(Object.keys(characters), function(cid) {
        members[cid] = false;
    });

    io.on('connection', function(socket){

        var room = 'default room';
        socket.join(room);

        var info = _.map(members, function(v, cid) {
            return { cid: cid, color: characters[cid]['color']}
        });

        socket.emit('info', info);

        var cid = _.sample(Object.keys(characters), 1)[0];
        var cname = characters[cid]['name'];
        members[cid] = true;

        io.to(room).emit('chat', { name: cname, t: 'sysin'});
        io.to(room).emit('info', [{ cid: cid, color: characters[cid]['color']}]);
        console.log('a user connected', socket.id);

        socket.on('chat', function(msg){
            console.log(cname, msg);
            if (msg === '') msg = characters[cid]['remark'];
            io.to(room).emit('chat', { cid: cid, name: cname, msg: msg, t:''});
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
            members[cid] = false;
            io.to(room).emit('chat', { name: cname, t: 'sysout'});

        });
    });
    return io;
}
