require(exports => {
    "use strict";
    // Copyright 2018-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContactListItem = void 0;
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const About_1 = require("./conversation/About");
    const Avatar_1 = require("./Avatar");
    const Emojify_1 = require("./conversation/Emojify");
    const InContactsIcon_1 = require("./InContactsIcon");
    class ContactListItem extends react_1.default.Component {
        renderAvatar() {
            const { avatarPath, i18n, color, name, phoneNumber, profileName, title, } = this.props;
            return (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 }));
        }
        render() {
            const { about, i18n, isAdmin, isMe, name, onClick, title } = this.props;
            const displayName = isMe ? i18n('you') : title;
            const shouldShowIcon = Boolean(name);
            return (react_1.default.createElement("button", { onClick: onClick, className: classnames_1.default('module-contact-list-item', onClick ? 'module-contact-list-item--with-click-handler' : null), type: "button" },
                this.renderAvatar(),
                react_1.default.createElement("div", { className: "module-contact-list-item__text" },
                    react_1.default.createElement("div", { className: "module-contact-list-item__left" },
                        react_1.default.createElement("div", { className: "module-contact-list-item__text__name" },
                            react_1.default.createElement(Emojify_1.Emojify, { text: displayName }),
                            shouldShowIcon ? (react_1.default.createElement("span", null,
                                ' ',
                                react_1.default.createElement(InContactsIcon_1.InContactsIcon, { i18n: i18n }))) : null),
                        react_1.default.createElement("div", { className: "module-contact-list-item__text__additional-data" },
                            react_1.default.createElement(About_1.About, { text: about }))),
                    isAdmin ? (react_1.default.createElement("div", { className: "module-contact-list-item__admin" }, i18n('GroupV2--admin'))) : null)));
        }
    }
    exports.ContactListItem = ContactListItem;
});