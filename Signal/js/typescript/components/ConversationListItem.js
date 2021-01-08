(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ConversationListItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Avatar_1 = window.ts.components.Avatar;
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    const Timestamp_1 = window.ts.components.conversation.Timestamp;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const TypingAnimation_1 = window.ts.components.conversation.TypingAnimation;
    class ConversationListItem extends react_1.default.PureComponent {
        renderAvatar() {
            const { avatarPath, color, type, i18n, isMe, name, phoneNumber, profileName, } = this.props;
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__avatar-container" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, noteToSelf: isMe, conversationType: type, i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 48 }),
                this.renderUnread()));
        }
        renderUnread() {
            const { unreadCount } = this.props;
            if (unreadCount > 0) {
                return (react_1.default.createElement("div", { className: "module-conversation-list-item__unread-count" }, unreadCount));
            }
            return null;
        }
        renderHeader() {
            const { unreadCount, i18n, isMe, lastUpdated, name, phoneNumber, profileName, } = this.props;
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__header" },
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-conversation-list-item__header__name', unreadCount > 0
                        ? 'module-conversation-list-item__header__name--with-unread'
                        : null)
                }, isMe ? (i18n('noteToSelf')) : (react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: phoneNumber, name: name, profileName: profileName }))),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-conversation-list-item__header__date', unreadCount > 0
                        ? 'module-conversation-list-item__header__date--has-unread'
                        : null)
                },
                    react_1.default.createElement(Timestamp_1.Timestamp, { timestamp: lastUpdated, extended: false, module: "module-conversation-list-item__header__timestamp", i18n: i18n }))));
        }
        renderMessage() {
            const { lastMessage, typingContact, unreadCount, i18n } = this.props;
            if (!lastMessage && !typingContact) {
                return null;
            }
            const text = lastMessage && lastMessage.text ? lastMessage.text : '';
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__message" },
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-conversation-list-item__message__text', unreadCount > 0
                        ? 'module-conversation-list-item__message__text--has-unread'
                        : null)
                }, typingContact ? (react_1.default.createElement(TypingAnimation_1.TypingAnimation, { i18n: i18n })) : (react_1.default.createElement(react_1.default.Fragment, null,
                    shouldShowDraft ? (react_1.default.createElement("span", { className: "module-conversation-list-item__message__draft-prefix" }, i18n('ConversationListItem--draft-prefix'))) : null,
                    react_1.default.createElement(MessageBody_1.MessageBody, { text: text, disableJumbomoji: true, disableLinks: true, i18n: i18n })))),
                lastMessage && lastMessage.status ? (react_1.default.createElement("div", { className: classnames_1.default('module-conversation-list-item__message__status-icon', `module-conversation-list-item__message__status-icon--${lastMessage.status}`) })) : null));
        }
        render() {
            const { unreadCount, onClick, id, isSelected, style } = this.props;
            return (react_1.default.createElement("div", {
                role: "button", onClick: () => {
                    if (onClick) {
                        onClick(id);
                    }
                }, style: style, className: classnames_1.default('module-conversation-list-item', unreadCount > 0 ? 'module-conversation-list-item--has-unread' : null, isSelected ? 'module-conversation-list-item--is-selected' : null)
            },
                this.renderAvatar(),
                react_1.default.createElement("div", { className: "module-conversation-list-item__content" },
                    this.renderHeader(),
                    this.renderMessage())));
        }
    }
    exports.ConversationListItem = ConversationListItem;
})();