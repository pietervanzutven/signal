require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Message_1 = require("./Message");
    const CallingNotification_1 = require("./CallingNotification");
    const InlineNotificationWrapper_1 = require("./InlineNotificationWrapper");
    const UnsupportedMessage_1 = require("./UnsupportedMessage");
    const TimerNotification_1 = require("./TimerNotification");
    const SafetyNumberNotification_1 = require("./SafetyNumberNotification");
    const VerificationNotification_1 = require("./VerificationNotification");
    const GroupNotification_1 = require("./GroupNotification");
    const GroupV2Change_1 = require("./GroupV2Change");
    const GroupV1Migration_1 = require("./GroupV1Migration");
    const ResetSessionNotification_1 = require("./ResetSessionNotification");
    const ProfileChangeNotification_1 = require("./ProfileChangeNotification");
    class TimelineItem extends react_1.default.PureComponent {
        render() {
            const { conversationId, id, isSelected, item, i18n, messageSizeChanged, renderContact, returnToActiveCall, selectMessage, startCallingLobby, } = this.props;
            if (!item) {
                window.log.warn(`TimelineItem: item ${id} provided was falsey`);
                return null;
            }
            if (item.type === 'message') {
                return react_1.default.createElement(Message_1.Message, Object.assign({}, this.props, item.data, { i18n: i18n }));
            }
            let notification;
            if (item.type === 'unsupportedMessage') {
                notification = (react_1.default.createElement(UnsupportedMessage_1.UnsupportedMessage, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'callHistory') {
                notification = (react_1.default.createElement(CallingNotification_1.CallingNotification, Object.assign({ conversationId: conversationId, i18n: i18n, messageId: id, messageSizeChanged: messageSizeChanged, returnToActiveCall: returnToActiveCall, startCallingLobby: startCallingLobby }, item.data)));
            }
            else if (item.type === 'linkNotification') {
                notification = (react_1.default.createElement("div", { className: "module-message-unsynced" },
                    react_1.default.createElement("div", { className: "module-message-unsynced__icon" }),
                    i18n('messageHistoryUnsynced')));
            }
            else if (item.type === 'timerNotification') {
                notification = (react_1.default.createElement(TimerNotification_1.TimerNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'safetyNumberNotification') {
                notification = (react_1.default.createElement(SafetyNumberNotification_1.SafetyNumberNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'verificationNotification') {
                notification = (react_1.default.createElement(VerificationNotification_1.VerificationNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'groupNotification') {
                notification = (react_1.default.createElement(GroupNotification_1.GroupNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'groupV2Change') {
                notification = (react_1.default.createElement(GroupV2Change_1.GroupV2Change, Object.assign({ renderContact: renderContact }, item.data, { i18n: i18n })));
            }
            else if (item.type === 'groupV1Migration') {
                notification = (react_1.default.createElement(GroupV1Migration_1.GroupV1Migration, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'resetSessionNotification') {
                notification = (react_1.default.createElement(ResetSessionNotification_1.ResetSessionNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else if (item.type === 'profileChange') {
                notification = (react_1.default.createElement(ProfileChangeNotification_1.ProfileChangeNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else {
                // Weird, yes, but the idea is to get a compile error when we aren't comprehensive
                //   with our if/else checks above, but also log out the type we don't understand if
                //   we encounter it at runtime.
                const unknownItem = item;
                const asItem = unknownItem;
                throw new Error(`TimelineItem: Unknown type: ${asItem.type}`);
            }
            return (react_1.default.createElement(InlineNotificationWrapper_1.InlineNotificationWrapper, { id: id, conversationId: conversationId, isSelected: isSelected, selectMessage: selectMessage }, notification));
        }
    }
    exports.TimelineItem = TimelineItem;
});