require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const Calling_1 = require("../types/Calling");
    const missingCaseError_1 = require("./missingCaseError");
    function getDirectCallNotificationText({ wasIncoming, wasVideoCall, wasDeclined, acceptedTime, }, i18n) {
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
    function getGroupCallNotificationText(notification, i18n) {
        if (notification.ended) {
            return i18n('calling__call-notification__ended');
        }
        if (!notification.creator) {
            return i18n('calling__call-notification__started-by-someone');
        }
        if (notification.creator.isMe) {
            return i18n('calling__call-notification__started-by-you');
        }
        return i18n('calling__call-notification__started', [
            notification.creator.firstName || notification.creator.title,
        ]);
    }
    function getCallingNotificationText(notification, i18n) {
        switch (notification.callMode) {
            case Calling_1.CallMode.Direct:
                return getDirectCallNotificationText(notification, i18n);
            case Calling_1.CallMode.Group:
                return getGroupCallNotificationText(notification, i18n);
            default:
                window.log.error(missingCaseError_1.missingCaseError(notification));
                return '';
        }
    }
    exports.getCallingNotificationText = getCallingNotificationText;
});