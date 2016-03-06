(function(global) {
    'use strict';
    // identity::String -> String -> String
    const identity = (thing) => thing

    // wrap::String -> String -> String
    const wrap = (spacer) => (cell) => spacer + cell + spacer;

    const groupBy = (list, predicate) => {
        predicate = predicate || identity;

        return list.reduce((memo, item) => {
            const key = predicate(item);
            if(typeof memo[key] === 'undefined') {
                memo[key] = []
            }

            memo[key] = memo[key].concat([item]);
            return memo
        }, {})
    }

    const countBy = (list, predicate) => {
        let groups = groupBy(list, predicate)
        for (let p in groups) {
            groups[p] = groups[p].length
        }

        return groups;
    }

    class Othello {
        constructor () {
            this.button_id = 'othello';
            this.chatWork = new ChatWork();
            this.board = new Board();
        }

        start () {
            this.chatWork.send(`[code]${this.board.toString()}[/code]`);
        }

        reply () {
            this.chatWork.reply();
        }
    }
    global.Othello = Othello;
}(this));

$(document).ready(function(){
    var othello = new Othello();

    var othello_button_li = '<li id='+othello.button_id+' role="button" class="_showDescription icoFont" aria-label="チャットワークオセロ" style="font-size:13px;">[オセロ]</li>';
    $('#_chatSendTool').append(othello_button_li);

    $("#"+othello.button_id).on('click', function() {
        othello.start();
    });

    // 対局テストの為に暫定的に返すボタンを設置する。
    // このままではUIがイケてないので後で直す。
    var othello_return_button_li = '<li id="othello_return" role="button" class="_showDescription icoFont" aria-label="チャットワークオセロ" style="font-size:13px;">[オセロ返信]</li>';
    $('#_chatSendTool').append(othello_return_button_li);
    $("#othello_return").on('click', function() {
        othello.reply();
    });
});
