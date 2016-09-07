/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/25
 * Time: 17:29
 */

// Todo: linking server timeout
var urlRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
var wordRegex = /(link)|(pan)|(share)|(baidu)|(magnet)|(傻逼)|(你妈)|(妈逼)|(操你)/;

// init socket
var socket;
if (admin !== undefined && admin) {
    var pass = prompt("Pass");
    socket = io(window.location.origin, { query: "pass="+pass });
}
else {
    socket = io();
}

// bubble color info from server
// cooling status
var colorIndex = [], cooling = false, remarking = false;

// socket events
socket.on('chat', function(msg){
    //console.log(msg);

    if (msg.t.indexOf('sys') == -1)
        chat.items.unshift({
                name: msg.name,
                msg: msg.msg,
                background: 'linear-gradient(to bottom, '+colorIndex[msg.cid][1]+' 50%, '+colorIndex[msg.cid][0]+' 50%)',
                avatar: "transparent url('../images/avatars/"+msg.cid+".png') no-repeat center top",
                color: colorIndex[msg.cid][2],
                t: ''});
    else
        chat.items.unshift(msg);
});

socket.on('info', function(infos){
    //console.log(infos);
    $.each(infos, function(i, info) {
        if (!(info in colorIndex)) {
            var color = info.color,
                color1 = 'rgb(' + color.toString() + ')',
                color2 = 'rgb(' + colorLighter(color, 30).toString() + ')';

            colorIndex[info.cid] = [color1, color2];

            var luma = 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2];
            //console.log(luma);
            if (luma > 200)
                colorIndex[info.cid].push('#2f2f2f');
            else
                colorIndex[info.cid].push('#fff');

        }
    });
});

socket.on('offline', function(off){
    if (off.indexOf(socket.id) != -1) {
        socket.disconnect();
    }
});

var message = new Vue({
    el: '.box-message-inner',
    data: {
        message: ''
    },
    methods: {
        send: function() {

            if (cooling) return;

            //console.log(chat.items);
            var m = this.message.trim().slice(0, 140);

            if (remarking && m.length == 0) {
                alert('台词蓄力中...');
                return;
            }
            if (m.length == 0) {
                remarking = true;
                // remarking reset
                setTimeout(function() {
                    remarking = false;
                }, 20 * 1000);
            }

            if (urlRegex.test(m) || wordRegex.test(m)) {
                this.message = '';
                alert('停车！！！');
                return;
            }

            socket.emit('chat', m);
            $('body').animate({ scrollTop: 0 }, 200);

            if (!admin) {
                this.message = '阿姆斯特朗回旋加速喷气式阿姆斯特朗炮冷却中...';
                $('textarea').attr('disabled', true);
                cooling = true;
                setTimeout(function() {
                    message.message = '';
                    $('textarea').attr('disabled', false);
                    cooling = false;
                }, 8 * 1000);
            }
            else {
                this.message = '';
            }
        }
    }
});

var chat = new Vue({
    el: '.box-talks',
    data: {
        items: []
    }
});


// dom collecter
setInterval(function() {
    if (chat.items.length > 100) {
        $('body').animate({ scrollTop: 0 }, 200);
        chat.items = chat.items.slice(0, 25);
    }
}, 60 * 1000);


// util functions
var colorLighter = function(rgb, percent) {
    return [parseInt(rgb[0] + (256 - rgb[0]) * percent / 100),
        parseInt(rgb[1] + (256 - rgb[1]) * percent / 100),
        parseInt(rgb[2] + (256 - rgb[2]) * percent / 100)]
};
