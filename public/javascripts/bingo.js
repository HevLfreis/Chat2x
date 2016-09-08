/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/9/1
 * Time: 15:57
 */

var num = 0;

$('#back-to-top').avgrund({
    width: 320,
    height: 185,
    holderClass: 'inner',
    showClose: true,
    showCloseText: '关闭',
    onBlurContainer: '.container',
    onLoad: function (elem) {
        elem.hide();
    },
    onUnload: function (elem) {
        elem.show()
    },
    template: '<h3><strong>Chat2x</strong></h3>' +
    '<p>Online: '+num+'个基佬</p>' +
    '<div class="text-center">' +
    '<a href="#" class="cross">CROSS HORIZON</a>' +
    '</div>'
});

var chat = new Vue({
    el: '.box-talks',
    data: {
        items: []
    }
});

$.get('/list', function(data) {

    $.each(Object.keys(data), function(i, h) {
        var msg = data[h];
        var color1 = 'rgb(' + msg.color.toString() + ')';
        var color2 = 'rgb(' + colorLighter(msg.color, 30).toString() + ')';
        chat.items.push( { name: msg.name,
            msg: msg.remark,
            background: 'linear-gradient(to bottom, '+color2+' 50%, '+color1+' 50%)',
            avatar: "transparent url('../images/avatars/"+h+".png') no-repeat center top",
            t: ''})
    });

});

var colorLighter = function(rgb, percent) {
    return [parseInt(rgb[0] + (256 - rgb[0]) * percent / 100),
        parseInt(rgb[1] + (256 - rgb[1]) * percent / 100),
        parseInt(rgb[2] + (256 - rgb[2]) * percent / 100)]
};