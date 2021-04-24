(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Conversation = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createLastMessageUpdate = ({ currentTimestamp, lastMessage, lastMessageStatus, lastMessageNotificationText, }) => {
        if (!lastMessage) {
            return {
                lastMessage: '',
                lastMessageStatus: null,
                timestamp: null,
            };
        }
        const { type, expirationTimerUpdate, deletedForEveryone } = lastMessage;
        const isMessageHistoryUnsynced = type === 'message-history-unsynced';
        const isVerifiedChangeMessage = type === 'verified-change';
        const isExpireTimerUpdateFromSync = Boolean(expirationTimerUpdate && expirationTimerUpdate.fromSync);
        const shouldUpdateTimestamp = Boolean(!isMessageHistoryUnsynced &&
            !isVerifiedChangeMessage &&
            !isExpireTimerUpdateFromSync);
        const newTimestamp = shouldUpdateTimestamp
            ? lastMessage.sent_at
            : currentTimestamp;
        const shouldUpdateLastMessageText = !isVerifiedChangeMessage;
        const newLastMessageText = shouldUpdateLastMessageText
            ? lastMessageNotificationText
            : '';
        return {
            lastMessage: deletedForEveryone ? '' : newLastMessageText || '',
            lastMessageStatus: lastMessageStatus || null,
            timestamp: newTimestamp || null,
            lastMessageDeletedForEveryone: deletedForEveryone,
        };
    };
})();