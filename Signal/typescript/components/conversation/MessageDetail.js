require(exports => {
    "use strict";
    // Copyright 2018-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const moment_1 = __importDefault(require("moment"));
    const Avatar_1 = require("../Avatar");
    const ContactName_1 = require("./ContactName");
    const Message_1 = require("./Message");
    const _keyForError = (error) => {
        return `${error.name}-${error.message}`;
    };
    class MessageDetail extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.focusRef = react_1.default.createRef();
        }
        componentDidMount() {
            // When this component is created, it's initially not part of the DOM, and then it's
            //   added off-screen and animated in. This ensures that the focus takes.
            setTimeout(() => {
                if (this.focusRef.current) {
                    this.focusRef.current.focus();
                }
            });
        }
        renderAvatar(contact) {
            const { i18n } = this.props;
            const { avatarPath, color, phoneNumber, name, profileName, title, } = contact;
            return (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 }));
        }
        renderDeleteButton() {
            const { i18n, message } = this.props;
            return (react_1.default.createElement("div", { className: "module-message-detail__delete-button-container" },
                react_1.default.createElement("button", {
                    type: "button", onClick: () => {
                        message.deleteMessage(message.id);
                    }, className: "module-message-detail__delete-button"
                }, i18n('deleteThisMessage'))));
        }
        renderContact(contact) {
            const { i18n } = this.props;
            const errors = contact.errors || [];
            const errorComponent = contact.isOutgoingKeyError ? (react_1.default.createElement("div", { className: "module-message-detail__contact__error-buttons" },
                react_1.default.createElement("button", { type: "button", className: "module-message-detail__contact__show-safety-number", onClick: contact.onShowSafetyNumber }, i18n('showSafetyNumber')),
                react_1.default.createElement("button", { type: "button", className: "module-message-detail__contact__send-anyway", onClick: contact.onSendAnyway }, i18n('sendAnyway')))) : null;
            const statusComponent = !contact.isOutgoingKeyError ? (react_1.default.createElement("div", { className: classnames_1.default('module-message-detail__contact__status-icon', `module-message-detail__contact__status-icon--${contact.status}`) })) : null;
            const unidentifiedDeliveryComponent = contact.isUnidentifiedDelivery ? (react_1.default.createElement("div", { className: "module-message-detail__contact__unidentified-delivery-icon" })) : null;
            return (react_1.default.createElement("div", { key: contact.phoneNumber, className: "module-message-detail__contact" },
                this.renderAvatar(contact),
                react_1.default.createElement("div", { className: "module-message-detail__contact__text" },
                    react_1.default.createElement("div", { className: "module-message-detail__contact__name" },
                        react_1.default.createElement(ContactName_1.ContactName, { phoneNumber: contact.phoneNumber, name: contact.name, profileName: contact.profileName, title: contact.title, i18n: i18n })),
                    errors.map(error => (react_1.default.createElement("div", { key: _keyForError(error), className: "module-message-detail__contact__error" }, error.message)))),
                errorComponent,
                unidentifiedDeliveryComponent,
                statusComponent));
        }
        renderContacts() {
            const { contacts } = this.props;
            if (!contacts || !contacts.length) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-message-detail__contact-container" }, contacts.map(contact => this.renderContact(contact))));
        }
        render() {
            const { errors, message, receivedAt, sentAt, i18n } = this.props;
            return (
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                react_1.default.createElement("div", { className: "module-message-detail", tabIndex: 0, ref: this.focusRef },
                    react_1.default.createElement("div", { className: "module-message-detail__message-container" },
                        react_1.default.createElement(Message_1.Message, Object.assign({}, message, { i18n: i18n }))),
                    react_1.default.createElement("table", { className: "module-message-detail__info" },
                        react_1.default.createElement("tbody", null,
                            (errors || []).map(error => (react_1.default.createElement("tr", { key: _keyForError(error) },
                                react_1.default.createElement("td", { className: "module-message-detail__label" }, i18n('error')),
                                react_1.default.createElement("td", null,
                                    ' ',
                                    react_1.default.createElement("span", { className: "error-message" }, error.message),
                                    ' ')))),
                            react_1.default.createElement("tr", null,
                                react_1.default.createElement("td", { className: "module-message-detail__label" }, i18n('sent')),
                                react_1.default.createElement("td", null,
                                    moment_1.default(sentAt).format('LLLL'),
                                    ' ',
                                    react_1.default.createElement("span", { className: "module-message-detail__unix-timestamp" },
                                        "(",
                                        sentAt,
                                        ")"))),
                            receivedAt ? (react_1.default.createElement("tr", null,
                                react_1.default.createElement("td", { className: "module-message-detail__label" }, i18n('received')),
                                react_1.default.createElement("td", null,
                                    moment_1.default(receivedAt).format('LLLL'),
                                    ' ',
                                    react_1.default.createElement("span", { className: "module-message-detail__unix-timestamp" },
                                        "(",
                                        receivedAt,
                                        ")")))) : null,
                            react_1.default.createElement("tr", null,
                                react_1.default.createElement("td", { className: "module-message-detail__label" }, message.direction === 'incoming' ? i18n('from') : i18n('to'))))),
                    this.renderContacts(),
                    this.renderDeleteButton()));
        }
    }
    exports.MessageDetail = MessageDetail;
});