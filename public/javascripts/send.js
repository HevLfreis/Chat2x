/**
 * Created by hevlhayt@foxmail.com
 * Date: 2016/8/25
 * Time: 17:29
 */

$('#send').click(function() {
    var text = $('textarea').val();
    $('textarea').val('');
    var $copy = $('.msg-default').first().clone();
    $copy.find('.msg-bubble').text(text);
    $('body').animate({ scrollTop: 0 }, 200);
    $('.box-talks').prepend($copy);

});