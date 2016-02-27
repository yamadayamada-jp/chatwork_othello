'use strict';

// wrap::String -> String -> String
const wrap = (spacer) => (cell) => spacer + cell + spacer;

// 0:なし
// 1:黒
// 2:白
class Board {
    constructor () {
        this.grid = [
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

    inBounds(x, y) {
        return (0 <= y && y < this.grid.length) && (0 <= x && x < this.grid[0].length)
    }

    get (x, y) {
        if (!this.inBounds(x, y)) {
            throw new TypeError(`Out of bounds (x:${x}, y:${y})`)
        }

        return this.grid[y][x];
    }

    set (x, y, blackOrWhite) {
        if (!this.canSet(x, y, blackOrWhite)) {
            throw new TypeError(`Cannot set (x:${x}, y:${y})`)
        }

        const reversed = (blackOrWhite === 1 ? 2 : 1)

        const diffs = this.getOmnidirection();
        const changeCoords = diffs.reduce((memo, diff) => {
            let nextY = y + diff[0];
            let nextX = x + diff[1];

            const coords = [];
            while(this.inBounds(nextX, nextY) && this.get(nextX, nextY) === reversed) {
                coords.push([nextX, nextY])
                nextY += diff[0];
                nextX += diff[1];
            }

            return memo.concat(coords)
        }, [])

        this.grid[y][x] = blackOrWhite
        changeCoords.forEach((coords) => {
            const x = coords[0]
            const y = coords[1]

            this.grid[y][x] = blackOrWhite
        })
    }

    canSet (x, y, blackOrWhite) {
        // 変化量の一覧
        const diffs = this.getOmnidirection();

        // 置こうとしているセルが空でない
        if (this.get(x, y) !== 0) return false;

        const reversed = (blackOrWhite === 1 ? 2 : 1)
        return diffs.some((diff) => {
            const nextY = y + diff[0];
            const nextX = x + diff[1];

            // 範囲外 or 隣接する先が反対の色ではない
            if(!this.inBounds(nextX, nextY) || this.get(nextX, nextY) !== reversed) return false;

            const nexts = this.getStraightLine(nextX, nextY, diff[1], diff[0], this.get.bind(this))
            const idx = nexts.indexOf(blackOrWhite)

            // 延長線上に自分自身の色がない(挟めない)
            if (idx < 0) return false;

            const allReversed = nexts.slice(0, idx).every((cell) => cell === reversed)

            // 間に相手の色以外が混じっている(挟めない)
            if (!allReversed) return false;

            return true
        })
    }

    getOmnidirection () {
        return [
            [-1, -1], // ↖
            [-1, 0],  // ↑
            [-1, 1],  // ↗
            [0, 1],   // →
            [1, 1],   // ↘
            [1, 0],   // ↓
            [1, -1],  // ↙
            [0, -1],  // ←
        ]
    }

    // (startY, startX)から(diffX, diffY)方向に移動した場合の延長線上のセルの値を返す
    // (startY, startX)を含む
    getStraightLine (startX, startY, diffX, diffY, predicate) {
        let result = [];

        while(this.inBounds(startX, startY)) {
            result.push(predicate(startX, startY));

            startX += diffX
            startY += diffY
        }

        return result;
    }

    toString () {
        const toCell = (cell) => [' ', '●', '◯'][cell]

        const header = '┌───┬───┬───┬───┬───┬───┬───┬───┐';
        const border = '├───┼───┼───┼───┼───┼───┼───┼───┤';
        const footer = '└───┴───┴───┴───┴───┴───┴───┴───┘';
        const separator = '│';

        const content = this.grid.map((line) => {
                return line.map(toCell)
                    .map(wrap(' '))
                    .join(separator);
            })
            .map(wrap(separator))
            .map(wrap('\n'))
            .join(border);

        return header + content + footer;
    }
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
