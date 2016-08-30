/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/25
 * Time: 17:29
 */

var colorIndex = [];

var socket = io();

socket.on('chat', function(msg){
    //console.log(msg);

    if (msg.t.indexOf('sys') == -1)
        chat.items.unshift({
                name: msg.name,
                msg: msg.msg,
                background: 'linear-gradient(to bottom, '+colorIndex[msg.cid][1]+' 50%, '+colorIndex[msg.cid][0]+' 50%)',
                avatar: "transparent url('../images/avatars/"+msg.cid+".png') no-repeat center top",
                t: ''});
    else
        chat.items.unshift(msg);
});

socket.on('info', function(infos){
    console.log(infos);
    $.each(infos, function(i, info) {
        if (!(info in colorIndex)) {
            var color1 = 'rgb(' + info.color.toString() + ')';
            var color2 = 'rgb(' + colorLighter(info.color, 30).toString() + ')';
            colorIndex[info.cid] = [color1, color2];
        }
    });

    console.log(colorIndex);
});

var message = new Vue({
    el: '.box-message-inner',
    data: {
        message: ''
    },
    methods: {
        send: function() {
            //console.log(chat.items);
            socket.emit('chat', this.message);
            //chat.items.unshift({name: 'L', msg: this.message});
            this.message = '';
            $('body').animate({ scrollTop: 0 }, 200);
        }
    }
});

var chat = new Vue({
    el: '.box-talks',
    data: {
        items: [
            //{ name: 'Kirito', t: 'sysin'},
            //{ name: 'Hi', msg: '???...' },
            //{ name: 'Light', msg: '...' },
            //{ name: 'Yagami', t: 'sysout'},
        ],
    }
});

//$.get('/history', function(data) {
//
//    $.each(Object.keys(data), function(i, h) {
//        var msg = data[h];
//        var color1 = 'rgb(' + msg.color.toString() + ')';
//        var color2 = 'rgb(' + colorLighter(msg.color, 30).toString() + ')';
//        chat.items.push( { name: msg.name,
//            msg: msg.remark,
//            background: 'linear-gradient(to bottom, '+color2+' 50%, '+color1+' 50%)',
//            avatar: "transparent url('../images/avatars/"+h+".png') no-repeat center top",
//            t: ''})
//    });
//
//});


var colorLighter = function(rgb, percent) {
    return [parseInt(rgb[0] + (256 - rgb[0]) * percent / 100),
        parseInt(rgb[1] + (256 - rgb[1]) * percent / 100),
        parseInt(rgb[2] + (256 - rgb[2]) * percent / 100)]
};