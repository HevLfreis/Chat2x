/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/9/1
 * Time: 15:57
 */

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