require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Timestamp_1 = require("./Timestamp");
    function getCallingNotificationText(callHistoryDetails, i18n) {
        const { wasIncoming, wasVideoCall, wasDeclined, acceptedTime, } = callHistoryDetails;
        const wasAccepted = Boolean(acceptedTime);
        if (wasIncoming) {
            if (wasDeclined) {
                if (wasVideoCall) {
                    return i18n('declinedIncomingVideoCall');
                }
                return i18n('declinedIncomingAudioCall');
            }
            if (wasAccepted) {
                if (wasVideoCall) {
                    return i18n('acceptedIncomingVideoCall');
                }
                return i18n('acceptedIncomingAudioCall');
            }
            if (wasVideoCall) {
                return i18n('missedIncomingVideoCall');
            }
            return i18n('missedIncomingAudioCall');
        }
        if (wasAccepted) {
            if (wasVideoCall) {
                return i18n('acceptedOutgoingVideoCall');
            }
            return i18n('acceptedOutgoingAudioCall');
        }
        if (wasVideoCall) {
            return i18n('missedOrDeclinedOutgoingVideoCall');
        }
        return i18n('missedOrDeclinedOutgoingAudioCall');
    }
    exports.getCallingNotificationText = getCallingNotificationText;
    exports.CallingNotification = (props) => {
        const { callHistoryDetails, i18n } = props;
        if (!callHistoryDetails) {
            return null;
        }
        const { acceptedTime, endedTime, wasVideoCall } = callHistoryDetails;
        const callType = wasVideoCall ? 'video' : 'audio';
        return (react_1.default.createElement("div", { className: `module-message-calling--notification module-message-calling--${callType}` },
            react_1.default.createElement("div", { className: `module-message-calling--${callType}__icon` }),
            getCallingNotificationText(callHistoryDetails, i18n),
            react_1.default.createElement("div", null,
                react_1.default.createElement(Timestamp_1.Timestamp, { i18n: i18n, timestamp: acceptedTime || endedTime, extended: true, direction: "outgoing", withImageNoCaption: false, withSticker: false, withTapToViewExpired: false, module: "module-message__metadata__date" }))));
    };
});