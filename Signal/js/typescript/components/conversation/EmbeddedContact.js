(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.EmbeddedContact = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const Contact_1 = window.ts.types.Contact;
    class EmbeddedContact extends react_1.default.Component {
        render() {
            const { contact, hasSignalAccount, i18n, onOpenContact, onSendMessage, } = this.props;
            return (react_1.default.createElement("div", { className: "embedded-contact", onClick: onOpenContact },
                react_1.default.createElement("div", { className: "first-line" },
                    renderAvatar(contact),
                    react_1.default.createElement("div", { className: "text-container" },
                        renderName(contact),
                        renderContactShorthand(contact))),
                renderSendMessage({ hasSignalAccount, i18n, onSendMessage })));
        }
    }
    exports.EmbeddedContact = EmbeddedContact;
    // Note: putting these below the main component so style guide picks up EmbeddedContact
    function getInitials(name) {
        return name.trim()[0] || '#';
    }
    function renderAvatar(contact) {
        const { avatar } = contact;
        const path = avatar && avatar.avatar && avatar.avatar.path;
        if (!path) {
            const name = Contact_1.getName(contact);
            const initials = getInitials(name || '');
            return (react_1.default.createElement("div", { className: "image-container" },
                react_1.default.createElement("div", { className: "default-avatar" }, initials)));
        }
        return (react_1.default.createElement("div", { className: "image-container" },
            react_1.default.createElement("img", { src: path })));
    }
    exports.renderAvatar = renderAvatar;
    function renderName(contact) {
        return react_1.default.createElement("div", { className: "contact-name" }, Contact_1.getName(contact));
    }
    exports.renderName = renderName;
    function renderContactShorthand(contact) {
        const { number: phoneNumber, email } = contact;
        const firstNumber = phoneNumber && phoneNumber[0] && phoneNumber[0].value;
        const firstEmail = email && email[0] && email[0].value;
        return react_1.default.createElement("div", { className: "contact-method" }, firstNumber || firstEmail);
    }
    exports.renderContactShorthand = renderContactShorthand;
    function renderSendMessage(props) {
        const { hasSignalAccount, i18n, onSendMessage } = props;
        if (!hasSignalAccount) {
            return null;
        }
        // We don't want the overall click handler for this element to fire, so we stop
        //   propagation before handing control to the caller's callback.
        const onClick = (e) => {
            e.stopPropagation();
            onSendMessage();
        };
        return (react_1.default.createElement("div", { className: "send-message", onClick: onClick },
            react_1.default.createElement("button", { className: "inner" },
                react_1.default.createElement("div", { className: "icon bubble-icon" }),
                i18n('sendMessageToContact'))));
    }
    exports.renderSendMessage = renderSendMessage;
})();