/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/25
 * Time: 17:29
 */

$('button').bind("touchstart", function(){}, true);

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
var colorIndex = [],
    cooling = false,
    remarking = false,
    active = 0;

// Todo: fix width fixed when page return
socket.on('name', function(name) {
    var $btp = $('#back-to-top');
    $btp.width('auto');
    $btp.html('<span>连接到角色：'+name+'</span>');

    setTimeout(function() {
        $btp.find('span').fadeOut();
        $btp.animate({'width': 30}, 1000, function() {
            $(this).html('<i class="fa fa-info"></i>');
        });
    }, 2500);
});

//
socket.on('active', function(num) {
    active = num - 1;
});

// socket events
socket.on('chat', function(msg) {

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

//
socket.on('info', function(infos) {

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

//
socket.on('offline', function(off) {
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

            if (urlRegex.test(m.toLowerCase()) || wordRegex.test(m.toLowerCase())) {
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
                }, 5 * 1000);
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

// popin
$('#back-to-top').avgrund({
    width: 320,
    height: 335,
    holderClass: 'inner',
    showClose: true,
    showCloseText: '关闭',
    onBlurContainer: '.container',
    onLoad: function (elem) {
        elem.fadeOut();
    },
    onLoaded: function () {
        $('#active').text('现在有'+active+'个野生的魔法少女(๑•̀ㅂ•́)و✧');
    },
    onUnload: function (elem) {
        elem.fadeIn();
    },
    template: '<h3><strong>Chat2x</strong>: 次元聊天室</h3>' +
    '<p>随机分配动漫角色，两分钟后刷新更换</p>' +
    '<p>发言有冷却时间，直接点POST发送角色台词</p>' +
    '<p>裂缝崩坏: 每天PM6:30-PM11:35</p>' +
    '<p>催更，意见，技术讨论群331774726</p>' +
    '<p>我的主页: seeleit.com</p>' +
    '<p class="text-danger">今日新增角色：集，祈，秀吉</p><br>' +
    '<p id="active">现在有'+active+'个野生的魔法少女(๑•̀ㅂ•́)و✧</p>' +
    '<div class="text-center">' +
    '<a href="#" class="cross disabled">CROSS HORIZON</a>' +
    '</div>'
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

