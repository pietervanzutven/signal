(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ContactListItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Avatar_1 = window.ts.components.Avatar;
    const Emojify_1 = window.ts.components.conversation.Emojify;
    class ContactListItem extends react_1.default.Component {
        renderAvatar() {
            const { avatarPath, i18n, color, name, phoneNumber, profileName, } = this.props;
            return (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 48 }));
        }
        render() {
            const { i18n, name, onClick, isMe, phoneNumber, profileName, verified, } = this.props;
            const title = name ? name : phoneNumber;
            const displayName = isMe ? i18n('me') : title;
            const profileElement = !isMe && profileName && !name ? (react_1.default.createElement("span", { className: "module-contact-list-item__text__profile-name" },
                "~",
                react_1.default.createElement(Emojify_1.Emojify, { text: profileName }))) : null;
            const showNumber = isMe || name;
            const showVerified = !isMe && verified;
            return (react_1.default.createElement("div", { role: "button", onClick: onClick, className: classnames_1.default('module-contact-list-item', onClick ? 'module-contact-list-item--with-click-handler' : null) },
                this.renderAvatar(),
                react_1.default.createElement("div", { className: "module-contact-list-item__text" },
                    react_1.default.createElement("div", { className: "module-contact-list-item__text__name" },
                        react_1.default.createElement(Emojify_1.Emojify, { text: displayName }),
                        " ",
                        profileElement),
                    react_1.default.createElement("div", { className: "module-contact-list-item__text__additional-data" },
                        showVerified ? (react_1.default.createElement("div", { className: "module-contact-list-item__text__verified-icon" })) : null,
                        showVerified ? ` ${i18n('verified')}` : null,
                        showVerified && showNumber ? ' ∙ ' : null,
                        showNumber ? phoneNumber : null))));
        }
    }
    exports.ContactListItem = ContactListItem;
})();