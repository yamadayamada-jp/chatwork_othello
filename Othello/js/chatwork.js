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

    class ChatWork {

        /**
         * 現在チャット本文入力フォームに入力されているテキストを取得する
         *
         * @return string
         */
        getMessageByInput() {
            return $("#_chatText").val();
        }

        /**
         * 現在入力しているメッセージ+αを送信する。
         * +αは引数で指定する。
         *
         * @param string message 追加で入力するメッセージ。
         */
        send (message){
            var inputted_message = this.getMessageByInput();
            if(!this.isToOrReplyMessage(inputted_message)){
                alert('相手を選択して下さい');
                return false;
            }
            $("#_chatText").val(inputted_message + message);
            $("#_sendButton").trigger('click');
        }

        reply () {
            var reply_board_string = this.getBoardAtReply();
            // [TODO]本来ここでBoardのインスタンスを立てるべきではない（Othelloクラスで立てているのでそちらでやるべき）
            // デバッグの為に一時的に置いているので、後ほど移動すること。
            this.board = new Board();
            var board_array = this.board.decodeStringGameBoard(reply_board_string);
            console.log(board_array);
        }

        /**
         * 返信ボタンを押した際に返信先の相手をチェックして、直前の盤面を文字列で取得する。
         */
         getBoardAtReply (){
            var inputted_message = this.getMessageByInput();
            var re_id = this.getReplyMessageIdByMessage(inputted_message);
            if(!re_id){
                alert('相手を選択して下さい');
                return false;
            }
            var re_message = this.getMessageById(re_id);
            return this.getOthelloBoardMessage(re_message);
         }

        /**
         * メッセージ入力欄にTO、もしくは返信に該当する文字列があるかチェックする。
         *
         * @return bool
         */
        isToOrReplyMessage (now_messeage){
            if(now_messeage.indexOf('[To:') !== -1 || now_messeage.indexOf('[返信')  !== -1){
                return true;
            } else {
                return false;
            }
        }

        /**
         * メッセージIDからメッセージ本文を取得する
         *
         * @param  string id メッセージIDの番号
         * @return string
         */
        getMessageById (id){
            return $('#_messageId'+id).find('pre').text();
        }

        /**
         * 取得したメッセージ中に返信先があるかどうか確認して、存在した場合返信先のメッセージIDを抽出する。
         *
         * @param  string message メッセージ本文
         * @return string|bool    返信先ID取得失敗時はfalse
         */
         getReplyMessageIdByMessage (message){
            if(message.indexOf('[返信')  === -1){
                return false;
            }
            // 正規表現でmessageを走査。返信メッセージの場合、3番目の数字列が返信先ID
            var in_message_num = message.match(/[\d]+/g);
            if(typeof in_message_num[2] === undefined){
                return false;
            }
            return in_message_num[2];
         }

        /**
         * メッセージからオセロ盤のみを抽出する。
         */
        getOthelloBoardMessage(message){
            var start_board_value = '┌';
            var end_board_value = '┘';
            var board = message.match(/┌[─┬┐│┼┤└┴◯●\s├]+┘/);
            return board[0];
        }

        getMostNewMesseageID (){
            return $('#_messageIdEnd').prev().data('mid');
        }

        getReplyMessageID (id){
            return $('#_messageId'+id).find('.chatTimeLineReply').data('mid');
        }
    }
    global.ChatWork = ChatWork;
}(this));