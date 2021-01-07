(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation._contactUtil = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const Avatar_1 = window.ts.components.Avatar;
    const Spinner_1 = window.ts.components.Spinner;
    const Contact_1 = window.ts.types.Contact;
    // This file starts with _ to keep it from showing up in the StyleGuide.
    function renderAvatar({ contact, i18n, size, direction, }) {
        const { avatar } = contact;
        const avatarPath = avatar && avatar.avatar && avatar.avatar.path;
        const pending = avatar && avatar.avatar && avatar.avatar.pending;
        const name = Contact_1.getName(contact) || '';
        const spinnerSvgSize = size < 50 ? 'small' : 'normal';
        const spinnerSize = size < 50 ? '24px' : undefined;
        if (pending) {
            return (react_1.default.createElement("div", { className: "module-embedded-contact__spinner-container" },
                react_1.default.createElement(Spinner_1.Spinner, { svgSize: spinnerSvgSize, size: spinnerSize, direction: direction })));
        }
        return (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: "grey", conversationType: "direct", i18n: i18n, name: name, size: size }));
    }
    exports.renderAvatar = renderAvatar;
    function renderName({ contact, isIncoming, module, }) {
        return (react_1.default.createElement("div", { className: classnames_1.default(`module-${module}__contact-name`, isIncoming ? `module-${module}__contact-name--incoming` : null) }, Contact_1.getName(contact)));
    }
    exports.renderName = renderName;
    function renderContactShorthand({ contact, isIncoming, module, }) {
        const { number: phoneNumber, email } = contact;
        const firstNumber = phoneNumber && phoneNumber[0] && phoneNumber[0].value;
        const firstEmail = email && email[0] && email[0].value;
        return (react_1.default.createElement("div", { className: classnames_1.default(`module-${module}__contact-method`, isIncoming ? `module-${module}__contact-method--incoming` : null) }, firstNumber || firstEmail));
    }
    exports.renderContactShorthand = renderContactShorthand;
})();