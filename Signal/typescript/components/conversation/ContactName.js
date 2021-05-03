(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ContactName = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Emojify_1 = require("./Emojify");
    class ContactName extends react_1.default.Component {
        render() {
            const { module, title } = this.props;
            const prefix = module ? module : 'module-contact-name';
            return (react_1.default.createElement("span", { className: prefix, dir: "auto" },
                react_1.default.createElement(Emojify_1.Emojify, { text: title || '' })));
        }
    }
    exports.ContactName = ContactName;
})();