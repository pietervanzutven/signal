(function () {
    "use strict";

    window.types = window.types || {};
    const exports = window.types.Conversation = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const is_1 = __importDefault(window.sindresorhus.is);
    exports.createLastMessageUpdate = ({ currentLastMessageText, currentTimestamp, lastMessage, lastMessageNotificationText, }) => {
        if (lastMessage === null) {
            return {
                lastMessage: '',
                timestamp: null,
            };
        }
        const { type } = lastMessage;
        const isVerifiedChangeMessage = type === 'verified-change';
        const isExpiringMessage = is_1.default.object(lastMessage.expirationTimerUpdate);
        const shouldUpdateTimestamp = !isVerifiedChangeMessage && !isExpiringMessage;
        const newTimestamp = shouldUpdateTimestamp ?
            lastMessage.sent_at :
            currentTimestamp;
        const shouldUpdateLastMessageText = !isVerifiedChangeMessage;
        const newLastMessageText = shouldUpdateLastMessageText ?
            lastMessageNotificationText : currentLastMessageText;
        return {
            lastMessage: newLastMessageText,
            timestamp: newTimestamp,
        };
    };
})();