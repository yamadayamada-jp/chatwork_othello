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

        send (message){
            if(!this.isToOrReplyMessage($("#_chatText").val())){
                alert('相手を選択して下さい');
                return false;
            }
            $("#_chatText").val($("#_chatText").val() + message);
            $("#_sendButton").trigger('click');
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
         */
        getMessage (id){
            return $('#_messageId'+id).find('pre').text();
        }

        /**
         * メッセージからオセロ盤のみを抽出する。
         */
        getOthelloBoardMessage(message){
            var start_board_value = '┌';
            var end_board_value = '┘';
            return message.match(/┌[─┬┐│┼┤└┴◯●\s├]+┘$/);
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