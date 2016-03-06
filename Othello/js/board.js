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


            const reversed = (blackOrWhite === Board.BLACK ? Board.WHITE : Board.BLACK)

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

            const reversed = (blackOrWhite === Board.BLACK ? Board.WHITE : Board.BLACK)
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

            return header + content + footer + "\n" + this.getStatusString();
        }

        /**
         * 文字列で表現されたゲーム盤をパースしてゲームの進行状況を2次元配列で受け取る
         */
        decodeStringGameBoard (string_board){
            const onPiece = ['', '●', '◯']

            const header = '┌───┬───┬───┬───┬───┬───┬───┬───┐';
            const border = '├───┼───┼───┼───┼───┼───┼───┼───┤';
            const footer = '└───┴───┴───┴───┴───┴───┴───┴───┘';
            const separator = '│';

            var non_rim_board = string_board.replace(new RegExp(header+"\n", 'g'), '')
            .replace(new RegExp(border+"\n", 'g'), '')
            .replace(new RegExp(footer, 'g'), '');

            // セパレーター区切りで文字を分解
            // 文字列は空文字、スペース文字（石なし）、石（黒白2種類）、改行に分けられる。
            // 空文字は必ず区切りの先頭にある。これは利用されない為、2次元配列成形時に取り除く。
            // 改行は縦行の区切りをあわらす。配列を区切る際の文字列として利用する。
            var non_rim_boards = non_rim_board.split(separator);
            var col = [],
                row = [],
                col_idx = 0;
            $.each(non_rim_boards, function(i, square) {
                if(square === '') return true;
                // 改行（行の末尾）まで来たら、行の情報を列に保存。
                // 行情報をリセットして最後までリトライしつづける。
                if(square === "\n"){
                    col[col_idx] = row;
                    row = [];
                    col_idx ++;
                    return true;
                }
                // [FIXME]本来は何らかの方法で両端をトリムすべき。
                // スペース3つをスペース1つに上手くトリムする方法が見つからなかったので、
                // 今回は空行を全て取り除くことでチェックする。
                // 何かが残れば石があり、空文字になれば石がない。
                var trim_square = square.replace(/\s/g, '');
                var value = onPiece.indexOf(trim_square);
                row.push(value);
            });

            return col;
        }

        flatten () {
            return this.grid.reduce((memo, line) => memo.concat(line), []);
        }

        getStatus () {
            return countBy(this.flatten());
        }

        getStatusString () {
            const status = this.getStatus();
            return `黒:${status[Board.BLACK]}、白:${status[Board.WHITE]}、@:${status[Board.NONE]}手`;
        }
    }

    Board.NONE = 0;
    Board.BLACK = 1;
    Board.WHITE = 2;

    global.Board = Board;
}(this));