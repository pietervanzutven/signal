(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.TimelineItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const Message_1 = window.ts.components.conversation.Message;
    const InlineNotificationWrapper_1 = window.ts.components.conversation.InlineNotificationWrapper;
    const UnsupportedMessage_1 = window.ts.components.conversation.UnsupportedMessage;
    const TimerNotification_1 = window.ts.components.conversation.TimerNotification;
    const SafetyNumberNotification_1 = window.ts.components.conversation.SafetyNumberNotification;
    const VerificationNotification_1 = window.ts.components.conversation.VerificationNotification;
    const GroupNotification_1 = window.ts.components.conversation.GroupNotification;
    const ResetSessionNotification_1 = window.ts.components.conversation.ResetSessionNotification;
    class TimelineItem extends react_1.default.PureComponent {
        render() {
            const { conversationId, id, isSelected, item, i18n, selectMessage, } = this.props;
            if (!item) {
                // tslint:disable-next-line:no-console
                console.warn(`TimelineItem: item ${id} provided was falsey`);
                return null;
            }
            if (item.type === 'message') {
                return react_1.default.createElement(Message_1.Message, Object.assign({}, this.props, item.data, { i18n: i18n }));
            }
            let notification;
            if (item.type === 'unsupportedMessage') {
                notification = (react_1.default.createElement(UnsupportedMessage_1.UnsupportedMessage, Object.assign({}, this.props, item.data, { i18n: i18n })));
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
            else if (item.type === 'resetSessionNotification') {
                notification = (react_1.default.createElement(ResetSessionNotification_1.ResetSessionNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            else {
                throw new Error('TimelineItem: Unknown type!');
            }
            return (react_1.default.createElement(InlineNotificationWrapper_1.InlineNotificationWrapper, { id: id, conversationId: conversationId, isSelected: isSelected, selectMessage: selectMessage }, notification));
        }
    }
    exports.TimelineItem = TimelineItem;
})();