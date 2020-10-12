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
    const MessageBody_1 = window.ts.components.conversation.MessageBody;
    const Timestamp_1 = window.ts.components.conversation.Timestamp;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    function getInitial(name) {
        return name.trim()[0] || '#';
    }
    class ConversationListItem extends react_1.default.Component {
        renderAvatar() {
            const { avatarPath, color, i18n, name, phoneNumber, profileName, } = this.props;
            if (!avatarPath) {
                const initial = getInitial(name || '');
                return (react_1.default.createElement("div", { className: classnames_1.default('module-conversation-list-item__avatar', 'module-conversation-list-item__default-avatar', `module-conversation-list-item__default-avatar--${color}`) }, initial));
            }
            const title = `${name || phoneNumber}${!name && profileName ? ` ~${profileName}` : ''}`;
            return (react_1.default.createElement("img", { className: "module-conversation-list-item__avatar", alt: i18n('contactAvatarAlt', [title]), src: avatarPath }));
        }
        renderHeader() {
            const { i18n, lastUpdated, name, phoneNumber, profileName } = this.props;
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__header" },
                react_1.default.createElement("div", { className: "module-conversation-list-item__header__name" },
                    react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: phoneNumber, name: name, profileName: profileName, i18n: i18n })),
                react_1.default.createElement("div", { className: "module-conversation-list-item__header__date" },
                    react_1.default.createElement(Timestamp_1.Timestamp, { timestamp: lastUpdated, extended: false, module: "module-conversation-list-item__header__timestamp", i18n: i18n }))));
        }
        renderMessage() {
            const { lastMessage, hasUnread, i18n } = this.props;
            if (!lastMessage) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__message" },
                lastMessage.text ? (react_1.default.createElement("div", {
                    className: classnames_1.default('module-conversation-list-item__message__text', hasUnread
                        ? 'module-conversation-list-item__message__text--has-unread'
                        : null)
                },
                    react_1.default.createElement(MessageBody_1.MessageBody, { text: lastMessage.text, disableJumbomoji: true, disableLinks: true, i18n: i18n }))) : null,
                lastMessage.status ? (react_1.default.createElement("div", { className: classnames_1.default('module-conversation-list-item__message__status-icon', `module-conversation-list-item__message__status-icon--${lastMessage.status}`) })) : null));
        }
        render() {
            const { hasUnread, onClick, isSelected } = this.props;
            return (react_1.default.createElement("div", { role: "button", onClick: onClick, className: classnames_1.default('module-conversation-list-item', hasUnread ? 'module-conversation-list-item--has-unread' : null, isSelected ? 'module-conversation-list-item--is-selected' : null) },
                this.renderAvatar(),
                react_1.default.createElement("div", { className: "module-conversation-list-item__content" },
                    this.renderHeader(),
                    this.renderMessage())));
        }
    }
    exports.ConversationListItem = ConversationListItem;
})();