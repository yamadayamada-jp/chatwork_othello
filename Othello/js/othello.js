'use strict';

// wrap::String -> String -> String
const wrap = (spacer) => (cell) => spacer + cell + spacer;

class Othello {
    constructor () {
        this.button_id = 'othello';
        this.chatWork = new ChatWork();
        this.grid = this.getGrid();
    }

    start () {
        this.chatWork.send(`[code]${this.toBoard()}[/code]`);
    }

    toCell (cell) {
        return [' ', '●', '◯'][cell];
    }

    toBoard () {
        const header = '┌───┬───┬───┬───┬───┬───┬───┬───┐';
        const border = '├───┼───┼───┼───┼───┼───┼───┼───┤';
        const footer = '└───┴───┴───┴───┴───┴───┴───┴───┘';
        const separator = '│';

        const content = this.grid.map((line) => {
                return line.map(this.toCell)
                    .map(wrap(' '))
                    .join(separator);
            })
            .map(wrap(separator))
            .map(wrap('\n'))
            .join(border);

        return header + content + footer;
    }

    getGrid () {
        // 0: なし
        // 1: 黒
        // 2: 白
        return [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 2, 0, 0, 0],
            [0, 0, 0, 2, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
    }
}

var ChatWork = function(){
    this.send = function(message){
        if(!this.isToOrReplyMessage($("#_chatText").val())){
            alert('相手を選択して下さい');
            return false;
        }
        $("#_chatText").val($("#_chatText").val() + message);
        $("#_sendButton").trigger('click');
    };

    /**
     * メッセージ入力欄にTO、もしくは返信に該当する文字列があるかチェックする。
     *
     * @return bool
     */
    this.isToOrReplyMessage = function(now_messeage){
        if(now_messeage.indexOf('[To:') !== -1 || now_messeage.indexOf('[返信')  !== -1){
            return true;
        } else {
            return false;
        }
    }

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