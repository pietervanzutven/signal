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
    const classnames_1 = __importDefault(window.classnames);
    const _contactUtil_1 = window.ts.components.conversation._contactUtil;
    class EmbeddedContact extends react_1.default.Component {
        render() {
            const { contact, i18n, isIncoming, onClick, tabIndex, withContentAbove, withContentBelow, } = this.props;
            const module = 'embedded-contact';
            const direction = isIncoming ? 'incoming' : 'outgoing';
            return (react_1.default.createElement("button", {
                className: classnames_1.default('module-embedded-contact', `module-embedded-contact--${direction}`, withContentAbove
                    ? 'module-embedded-contact--with-content-above'
                    : null, withContentBelow
                    ? 'module-embedded-contact--with-content-below'
                    : null), onKeyDown: (event) => {
                        if (event.key !== 'Enter' && event.key !== 'Space') {
                            return;
                        }
                        if (onClick) {
                            event.stopPropagation();
                            event.preventDefault();
                            onClick();
                        }
                    }, onClick: (event) => {
                        if (onClick) {
                            event.stopPropagation();
                            event.preventDefault();
                            onClick();
                        }
                    }, tabIndex: tabIndex
            },
                _contactUtil_1.renderAvatar({ contact, i18n, size: 52, direction }),
                react_1.default.createElement("div", { className: "module-embedded-contact__text-container" },
                    _contactUtil_1.renderName({ contact, isIncoming, module }),
                    _contactUtil_1.renderContactShorthand({ contact, isIncoming, module }))));
        }
    }
    exports.EmbeddedContact = EmbeddedContact;
})();