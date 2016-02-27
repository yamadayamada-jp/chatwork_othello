var Othello = function(){
    var chatWork = new ChatWork();

    var board = '[code]┌───┬───┬───┬───┬───┬───┬───┬───┐\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n├───┼───┼───┼───┼───┼───┼───┼───┤\n│   │   │   │   │   │   │   │   │\n└───┴───┴───┴───┴───┴───┴───┴───┘[/code]';

    this.button_id = 'othello';

    this.start = function(){
        chatWork.send(board);
    };
};


var ChatWork = function(){
    this.send = function(message){
        $("#_chatText").val(message);
        $("#_sendButton").trigger('click');
    };

    /**
     * 最新のメッセージIDを取得する
     */
     this.getMostNewMesseageID = function(){
        return $('#_messageIdEnd').prev().data('mid');
     };

    /**
     * Re付きメッセージのIDを渡すと、Reを返した先のメッセージのIDを取得する
     */
    this.getReplyMessageID = function(id){
        return $('#_messageId'+id).find('.chatTimeLineReply').data('mid');
    };

};


$(document).ready(function(){
    var othello = new Othello();

    var othello_button_li = '<li id='+othello.button_id+' role="button" class="_showDescription icoFont" aria-label="チャットワークオセロ" style="font-size:13px;">[オセロ]</li>';
    $('#_chatSendTool').append(othello_button_li);

    $("#"+othello.button_id).on('click', function() {
        othello.start();
    });
});