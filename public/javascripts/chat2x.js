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
    remarking = [false, 0],
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

            if (m.length == 0) {
                if (remarking[0]) {
                    alert('台词蓄力中...');
                    return;
                }
                else if (remarking[1] == 1){
                    alert('发点别的吧...');
                    return;
                }
                else {
                    remarking[0] = true;
                    remarking[1] += 1;
                    setTimeout(function() {
                        remarking[0] = false;
                    }, 30 * 1000);
                }
            }

            //if (remarking == 1 && m.length == 0) {
            //    alert('台词蓄力中...');
            //    return;
            //}
            //if (m.length == 0) {
            //    remarking = 1;
            //    // remarking reset
            //    setTimeout(function() {
            //        remarking = 0;
            //    }, 30 * 1000);
            //}

            if (urlRegex.test(m.toLowerCase()) || wordRegex.test(m.toLowerCase())) {
                this.message = '';
                alert('停车！！！');
                return;
            }

            emitMessage(m);

            if (!admin) {
                this.message = '阿姆斯特朗回旋加速喷气式阿姆斯特朗炮冷却中...';
                $('textarea').attr('disabled', true);
                cooling = true;
                setTimeout(function() {
                    message.message = '';
                    $('textarea').attr('disabled', false);
                    cooling = false;
                }, coolingTime() * 1000);
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
// Todo: change inner to popin ?
$('#back-to-top').avgrund({
    width: 320,
    height: 315,
    holderClass: 'popin',
    showClose: true,
    showCloseText: '×',
    onBlurContainer: '.container',
    onLoad: function (elem) {
        scrollTop();
        elem.fadeOut();
    },
    onLoaded: function () {
        $('#active').text('现在有'+active+'个人類(๑•̀ㅂ•́)و✧');
    },
    onUnload: function (elem) {
        elem.fadeIn();
    },
    template: '<h3><strong>Chat2x</strong>: 次元聊天室</h3>' +
    '<p>随机分配动漫角色，两分钟后刷新更换</p>' +
    '<p>发言有冷却时间，直接点POST发送角色台词</p>' +
    '<p>次元崩坏: 每天PM6:30-PM11:35</p>' +
    '<p>无意义多开刷角色，刷屏的一律永封</p>' +
    '<p>催更，意见，技术讨论群331774726</p>' +
    '<p class="text-danger">今日新增角色：兵长，折娘</p><br>' +
    '<p id="active">现在有'+active+'个人類(๑•̀ㅂ•́)و✧</p>' +
    '<div>' +
    '<a href="http://seeleit.com/" target="_blank" class="cross">作者主页</a>' +
    '</div>'
});


// dom collecter
setInterval(function() {
    if (chat.items.length > 100) {
        scrollTop();
        chat.items = chat.items.slice(0, 25);
    }
}, 60 * 1000);


// util functions
function colorLighter(rgb, percent) {
    return [parseInt(rgb[0] + (256 - rgb[0]) * percent / 100),
        parseInt(rgb[1] + (256 - rgb[1]) * percent / 100),
        parseInt(rgb[2] + (256 - rgb[2]) * percent / 100)]
}

function emitMessage(m) {
    socket.emit('chat', m);
    if (remarking[1] > 0 && m.length != 0) remarking[1] -= 1;
    scrollTop();
}

function coolingTime() {
    if (active <= 20) return 5;
    else if (active >= 30) return 10;
    else {
        return (active - 20) * 0.5 + 5;
    }
}

function scrollTop() {
    $('body').animate({ scrollTop: 0 }, 200);
}


