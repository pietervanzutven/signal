(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ContactDetail = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Contact_1 = require("../../types/Contact");
    const missingCaseError_1 = require("../../util/missingCaseError");
    const _contactUtil_1 = require("./_contactUtil");
    function getLabelForEmail(method, i18n) {
        switch (method.type) {
            case Contact_1.ContactFormType.CUSTOM:
                return method.label || i18n('email');
            case Contact_1.ContactFormType.HOME:
                return i18n('home');
            case Contact_1.ContactFormType.MOBILE:
                return i18n('mobile');
            case Contact_1.ContactFormType.WORK:
                return i18n('work');
            default:
                throw missingCaseError_1.missingCaseError(method.type);
        }
    }
    function getLabelForPhone(method, i18n) {
        switch (method.type) {
            case Contact_1.ContactFormType.CUSTOM:
                return method.label || i18n('phone');
            case Contact_1.ContactFormType.HOME:
                return i18n('home');
            case Contact_1.ContactFormType.MOBILE:
                return i18n('mobile');
            case Contact_1.ContactFormType.WORK:
                return i18n('work');
            default:
                throw missingCaseError_1.missingCaseError(method.type);
        }
    }
    function getLabelForAddress(address, i18n) {
        switch (address.type) {
            case Contact_1.AddressType.CUSTOM:
                return address.label || i18n('address');
            case Contact_1.AddressType.HOME:
                return i18n('home');
            case Contact_1.AddressType.WORK:
                return i18n('work');
            default:
                throw missingCaseError_1.missingCaseError(address.type);
        }
    }
    class ContactDetail extends react_1.default.Component {
        // eslint-disable-next-line class-methods-use-this
        renderSendMessage({ hasSignalAccount, i18n, onSendMessage, }) {
            if (!hasSignalAccount) {
                return null;
            }
            // We don't want the overall click handler for this element to fire, so we stop
            //   propagation before handing control to the caller's callback.
            const onClick = (e) => {
                e.stopPropagation();
                onSendMessage();
            };
            return (react_1.default.createElement("button", { type: "button", className: "module-contact-detail__send-message", onClick: onClick },
                react_1.default.createElement("div", { className: "module-contact-detail__send-message__inner" },
                    react_1.default.createElement("div", { className: "module-contact-detail__send-message__bubble-icon" }),
                    i18n('sendMessageToContact'))));
        }
        // eslint-disable-next-line class-methods-use-this
        renderEmail(items, i18n) {
            if (!items || items.length === 0) {
                return undefined;
            }
            return items.map((item) => {
                return (react_1.default.createElement("div", { key: item.value, className: "module-contact-detail__additional-contact" },
                    react_1.default.createElement("div", { className: "module-contact-detail__additional-contact__type" }, getLabelForEmail(item, i18n)),
                    item.value));
            });
        }
        // eslint-disable-next-line class-methods-use-this
        renderPhone(items, i18n) {
            if (!items || items.length === 0) {
                return undefined;
            }
            return items.map((item) => {
                return (react_1.default.createElement("div", { key: item.value, className: "module-contact-detail__additional-contact" },
                    react_1.default.createElement("div", { className: "module-contact-detail__additional-contact__type" }, getLabelForPhone(item, i18n)),
                    item.value));
            });
        }
        // eslint-disable-next-line class-methods-use-this
        renderAddressLine(value) {
            if (!value) {
                return undefined;
            }
            return react_1.default.createElement("div", null, value);
        }
        // eslint-disable-next-line class-methods-use-this
        renderPOBox(poBox, i18n) {
            if (!poBox) {
                return null;
            }
            return (react_1.default.createElement("div", null,
                i18n('poBox'),
                " ",
                poBox));
        }
        // eslint-disable-next-line class-methods-use-this
        renderAddressLineTwo(address) {
            if (address.city || address.region || address.postcode) {
                return (react_1.default.createElement("div", null,
                    address.city,
                    " ",
                    address.region,
                    " ",
                    address.postcode));
            }
            return null;
        }
        renderAddresses(addresses, i18n) {
            if (!addresses || addresses.length === 0) {
                return undefined;
            }
            return addresses.map((address, index) => {
                return (
                    // eslint-disable-next-line react/no-array-index-key
                    react_1.default.createElement("div", { key: index, className: "module-contact-detail__additional-contact" },
                        react_1.default.createElement("div", { className: "module-contact-detail__additional-contact__type" }, getLabelForAddress(address, i18n)),
                        this.renderAddressLine(address.street),
                        this.renderPOBox(address.pobox, i18n),
                        this.renderAddressLine(address.neighborhood),
                        this.renderAddressLineTwo(address),
                        this.renderAddressLine(address.country)));
            });
        }
        render() {
            const { contact, hasSignalAccount, i18n, onSendMessage } = this.props;
            const isIncoming = false;
            const module = 'contact-detail';
            return (react_1.default.createElement("div", { className: "module-contact-detail" },
                react_1.default.createElement("div", { className: "module-contact-detail__avatar" }, _contactUtil_1.renderAvatar({ contact, i18n, size: 80 })),
                _contactUtil_1.renderName({ contact, isIncoming, module }),
                _contactUtil_1.renderContactShorthand({ contact, isIncoming, module }),
                this.renderSendMessage({ hasSignalAccount, i18n, onSendMessage }),
                this.renderPhone(contact.number, i18n),
                this.renderEmail(contact.email, i18n),
                this.renderAddresses(contact.address, i18n)));
        }
    }
    exports.ContactDetail = ContactDetail;
})();