(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.MessageSearchResult = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Avatar_1 = window.ts.components.Avatar;
    const MessageBodyHighlight_1 = window.ts.components.MessageBodyHighlight;
    const Timestamp_1 = window.ts.components.conversation.Timestamp;
    const ContactName_1 = window.ts.components.conversation.ContactName;
    class MessageSearchResult extends react_1.default.PureComponent {
        renderFromName() {
            const { from, i18n, to } = this.props;
            if (from.isMe && to.isMe) {
                return (react_1.default.createElement("span", { className: "module-message-search-result__header__name" }, i18n('noteToSelf')));
            }
            if (from.isMe) {
                return (react_1.default.createElement("span", { className: "module-message-search-result__header__name" }, i18n('you')));
            }
            return (react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: from.phoneNumber, name: from.name, profileName: from.profileName, module: "module-message-search-result__header__name" }));
        }
        renderFrom() {
            const { i18n, to, isSearchingInConversation } = this.props;
            const fromName = this.renderFromName();
            if (!to.isMe && !isSearchingInConversation) {
                return (react_1.default.createElement("div", { className: "module-message-search-result__header__from" },
                    fromName,
                    " ",
                    i18n('to'),
                    ' ',
                    react_1.default.createElement("span", { className: "module-mesages-search-result__header__group" },
                        react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: to.phoneNumber, name: to.name, profileName: to.profileName }))));
            }
            return (react_1.default.createElement("div", { className: "module-message-search-result__header__from" }, fromName));
        }
        renderAvatar() {
            const { from, i18n, to } = this.props;
            const isNoteToSelf = from.isMe && to.isMe;
            return (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: from.avatarPath, color: from.color, conversationType: "direct", i18n: i18n, name: name, noteToSelf: isNoteToSelf, phoneNumber: from.phoneNumber, profileName: from.profileName, size: 48 }));
        }
        render() {
            const { from, i18n, id, isSelected, conversationId, openConversationInternal, receivedAt, snippet, to, } = this.props;
            if (!from || !to) {
                return null;
            }
            return (react_1.default.createElement("div", {
                role: "button", onClick: () => {
                    if (openConversationInternal) {
                        openConversationInternal(conversationId, id);
                    }
                }, className: classnames_1.default('module-message-search-result', isSelected ? 'module-message-search-result--is-selected' : null)
            },
                this.renderAvatar(),
                react_1.default.createElement("div", { className: "module-message-search-result__text" },
                    react_1.default.createElement("div", { className: "module-message-search-result__header" },
                        this.renderFrom(),
                        react_1.default.createElement("div", { className: "module-message-search-result__header__timestamp" },
                            react_1.default.createElement(Timestamp_1.Timestamp, { timestamp: receivedAt, i18n: i18n }))),
                    react_1.default.createElement("div", { className: "module-message-search-result__body" },
                        react_1.default.createElement(MessageBodyHighlight_1.MessageBodyHighlight, { text: snippet, i18n: i18n })))));
        }
    }
    exports.MessageSearchResult = MessageSearchResult;
})();