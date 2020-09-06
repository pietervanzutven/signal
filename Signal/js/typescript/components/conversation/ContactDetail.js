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
    const react_1 = __importDefault(window.react);
    const Contact_1 = window.ts.types.Contact;
    const missingCaseError_1 = window.ts.util.missingCaseError;
    const EmbeddedContact_1 = window.ts.components.conversation.EmbeddedContact;
    function getLabelForContactMethod(method, i18n) {
        switch (method.type) {
            case Contact_1.ContactType.CUSTOM:
                return method.label;
            case Contact_1.ContactType.HOME:
                return i18n('home');
            case Contact_1.ContactType.MOBILE:
                return i18n('mobile');
            case Contact_1.ContactType.WORK:
                return i18n('work');
            default:
                return missingCaseError_1.missingCaseError(method.type);
        }
    }
    function getLabelForAddress(address, i18n) {
        switch (address.type) {
            case Contact_1.AddressType.CUSTOM:
                return address.label;
            case Contact_1.AddressType.HOME:
                return i18n('home');
            case Contact_1.AddressType.WORK:
                return i18n('work');
            default:
                return missingCaseError_1.missingCaseError(address.type);
        }
    }
    class ContactDetail extends react_1.default.Component {
        renderAdditionalContact(items, i18n) {
            if (!items || items.length === 0) {
                return;
            }
            return items.map((item) => {
                return (react_1.default.createElement("div", { key: item.value, className: "additional-contact" },
                    react_1.default.createElement("div", { className: "type" }, getLabelForContactMethod(item, i18n)),
                    item.value));
            });
        }
        renderAddressLine(value) {
            if (!value) {
                return;
            }
            return react_1.default.createElement("div", null, value);
        }
        renderPOBox(poBox, i18n) {
            if (!poBox) {
                return null;
            }
            return (react_1.default.createElement("div", null,
                i18n('poBox'),
                " ",
                poBox));
        }
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
                return;
            }
            return addresses.map((address, index) => {
                return (react_1.default.createElement("div", { key: index, className: "additional-contact" },
                    react_1.default.createElement("div", { className: "type" }, getLabelForAddress(address, i18n)),
                    this.renderAddressLine(address.street),
                    this.renderPOBox(address.pobox, i18n),
                    this.renderAddressLine(address.neighborhood),
                    this.renderAddressLineTwo(address),
                    this.renderAddressLine(address.country)));
            });
        }
        render() {
            const { contact, hasSignalAccount, i18n, onSendMessage } = this.props;
            return (react_1.default.createElement("div", { className: "contact-detail" },
                EmbeddedContact_1.renderAvatar(contact),
                EmbeddedContact_1.renderName(contact),
                EmbeddedContact_1.renderContactShorthand(contact),
                EmbeddedContact_1.renderSendMessage({ hasSignalAccount, i18n, onSendMessage }),
                this.renderAdditionalContact(contact.number, i18n),
                this.renderAdditionalContact(contact.email, i18n),
                this.renderAddresses(contact.address, i18n)));
        }
    }
    exports.ContactDetail = ContactDetail;
})();