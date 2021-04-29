(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ConversationListItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const lodash_1 = require("lodash");
    const Avatar_1 = require("./Avatar");
    const MessageBody_1 = require("./conversation/MessageBody");
    const Timestamp_1 = require("./conversation/Timestamp");
    const ContactName_1 = require("./conversation/ContactName");
    const TypingAnimation_1 = require("./conversation/TypingAnimation");
    const _util_1 = require("./_util");
    class ConversationListItem extends react_1.default.PureComponent {
        renderAvatar() {
            const { avatarPath, color, type, i18n, isMe, name, phoneNumber, profileName, title, } = this.props;
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__avatar-container" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, noteToSelf: isMe, conversationType: type, i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 }),
                this.renderUnread()));
        }
        renderUnread() {
            const { unreadCount } = this.props;
            if (lodash_1.isNumber(unreadCount) && unreadCount > 0) {
                return (react_1.default.createElement("div", { className: "module-conversation-list-item__unread-count" }, unreadCount));
            }
            return null;
        }
        renderHeader() {
            const { unreadCount, i18n, isMe, lastUpdated, name, phoneNumber, profileName, title, } = this.props;
            const withUnread = lodash_1.isNumber(unreadCount) && unreadCount > 0;
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__header" },
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-conversation-list-item__header__name', withUnread
                        ? 'module-conversation-list-item__header__name--with-unread'
                        : null)
                }, isMe ? (i18n('noteToSelf')) : (react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: phoneNumber, name: name, profileName: profileName, title: title, i18n: i18n }))),
                react_1.default.createElement("div", {
                    className: classnames_1.default('module-conversation-list-item__header__date', withUnread
                        ? 'module-conversation-list-item__header__date--has-unread'
                        : null)
                },
                    react_1.default.createElement(Timestamp_1.Timestamp, { timestamp: lastUpdated, extended: false, module: "module-conversation-list-item__header__timestamp", withUnread: withUnread, i18n: i18n }))));
        }
        renderMessage() {
            const { draftPreview, i18n, isAccepted, lastMessage, shouldShowDraft, typingContact, unreadCount, } = this.props;
            if (!lastMessage && !typingContact) {
                return null;
            }
            const withUnread = lodash_1.isNumber(unreadCount) && unreadCount > 0;
            const showingDraft = shouldShowDraft && draftPreview;
            const deletedForEveryone = Boolean(lastMessage && lastMessage.deletedForEveryone);
            // Note: instead of re-using showingDraft here we explode it because
            //   typescript can't tell that draftPreview is truthy otherwise
            const text = shouldShowDraft && draftPreview
                ? draftPreview
                : lastMessage && lastMessage.text
                    ? lastMessage.text
                    : '';
            return (react_1.default.createElement("div", { className: "module-conversation-list-item__message" },
                react_1.default.createElement("div", {
                    dir: "auto", className: classnames_1.default('module-conversation-list-item__message__text', withUnread
                        ? 'module-conversation-list-item__message__text--has-unread'
                        : null)
                }, !isAccepted ? (react_1.default.createElement("span", { className: "module-conversation-list-item__message-request" }, i18n('ConversationListItem--message-request'))) : typingContact ? (react_1.default.createElement(TypingAnimation_1.TypingAnimation, { i18n: i18n })) : (react_1.default.createElement(react_1.default.Fragment, null,
                    showingDraft ? (react_1.default.createElement("span", { className: "module-conversation-list-item__message__draft-prefix" }, i18n('ConversationListItem--draft-prefix'))) : deletedForEveryone ? (react_1.default.createElement("span", { className: "module-conversation-list-item__message__deleted-for-everyone" }, i18n('message--deletedForEveryone'))) : null,
                    react_1.default.createElement(MessageBody_1.MessageBody, { text: text.split('\n')[0], disableJumbomoji: true, disableLinks: true, i18n: i18n })))),
                !showingDraft && lastMessage && lastMessage.status ? (react_1.default.createElement("div", { className: classnames_1.default('module-conversation-list-item__message__status-icon', `module-conversation-list-item__message__status-icon--${lastMessage.status}`) })) : null));
        }
        render() {
            const { unreadCount, onClick, id, isSelected, style } = this.props;
            const withUnread = lodash_1.isNumber(unreadCount) && unreadCount > 0;
            return (react_1.default.createElement("button", {
                onClick: () => {
                    if (onClick) {
                        onClick(id);
                    }
                }, style: style, className: classnames_1.default('module-conversation-list-item', withUnread ? 'module-conversation-list-item--has-unread' : null, isSelected ? 'module-conversation-list-item--is-selected' : null), "data-id": _util_1.cleanId(id)
            },
                this.renderAvatar(),
                react_1.default.createElement("div", { className: "module-conversation-list-item__content" },
                    this.renderHeader(),
                    this.renderMessage())));
        }
    }
    exports.ConversationListItem = ConversationListItem;
})();