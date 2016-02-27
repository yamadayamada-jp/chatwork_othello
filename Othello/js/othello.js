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
        $("#_chatText").val($("#_chatText").val() + message);
        $("#_sendButton").trigger('click');
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