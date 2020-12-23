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
    const TimerNotification_1 = window.ts.components.conversation.TimerNotification;
    const SafetyNumberNotification_1 = window.ts.components.conversation.SafetyNumberNotification;
    const VerificationNotification_1 = window.ts.components.conversation.VerificationNotification;
    const GroupNotification_1 = window.ts.components.conversation.GroupNotification;
    const ResetSessionNotification_1 = window.ts.components.conversation.ResetSessionNotification;
    class TimelineItem extends react_1.default.PureComponent {
        render() {
            const { item, i18n } = this.props;
            if (!item) {
                throw new Error('TimelineItem: Item was not provided!');
            }
            if (item.type === 'message') {
                return react_1.default.createElement(Message_1.Message, Object.assign({}, this.props, item.data, { i18n: i18n }));
            }
            if (item.type === 'timerNotification') {
                return react_1.default.createElement(TimerNotification_1.TimerNotification, Object.assign({}, this.props, item.data, { i18n: i18n }));
            }
            if (item.type === 'safetyNumberNotification') {
                return (react_1.default.createElement(SafetyNumberNotification_1.SafetyNumberNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            if (item.type === 'verificationNotification') {
                return (react_1.default.createElement(VerificationNotification_1.VerificationNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            if (item.type === 'groupNotification') {
                return react_1.default.createElement(GroupNotification_1.GroupNotification, Object.assign({}, this.props, item.data, { i18n: i18n }));
            }
            if (item.type === 'resetSessionNotification') {
                return (react_1.default.createElement(ResetSessionNotification_1.ResetSessionNotification, Object.assign({}, this.props, item.data, { i18n: i18n })));
            }
            throw new Error('TimelineItem: Unknown type!');
        }
    }
    exports.TimelineItem = TimelineItem;
})();