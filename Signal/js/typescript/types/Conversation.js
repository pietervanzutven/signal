(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.Conversation = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const is_1 = __importDefault(window.sindresorhus.is);
    exports.createLastMessageUpdate = ({ currentLastMessageText, currentTimestamp, lastMessage, lastMessageStatus, lastMessageNotificationText, }) => {
        if (lastMessage === null) {
            return {
                lastMessage: '',
                lastMessageStatus: null,
                timestamp: null,
            };
        }
        const { type } = lastMessage;
        const isVerifiedChangeMessage = type === 'verified-change';
        const isExpiringMessage = is_1.default.object(lastMessage.expirationTimerUpdate);
        const shouldUpdateTimestamp = !isVerifiedChangeMessage && !isExpiringMessage;
        const newTimestamp = shouldUpdateTimestamp
            ? lastMessage.sent_at
            : currentTimestamp;
        const shouldUpdateLastMessageText = !isVerifiedChangeMessage;
        const newLastMessageText = shouldUpdateLastMessageText
            ? lastMessageNotificationText
            : currentLastMessageText;
        return {
            lastMessage: newLastMessageText,
            lastMessageStatus,
            timestamp: newTimestamp,
        };
    };
})();