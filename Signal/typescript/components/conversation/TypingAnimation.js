(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.TypingAnimation = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    exports.TypingAnimation = ({ i18n, color }) => (react_1.default.createElement("div", { className: "module-typing-animation", title: i18n('typingAlt') },
        react_1.default.createElement("div", { className: classnames_1.default('module-typing-animation__dot', 'module-typing-animation__dot--first', color ? `module-typing-animation__dot--${color}` : null) }),
        react_1.default.createElement("div", { className: "module-typing-animation__spacer" }),
        react_1.default.createElement("div", { className: classnames_1.default('module-typing-animation__dot', 'module-typing-animation__dot--second', color ? `module-typing-animation__dot--${color}` : null) }),
        react_1.default.createElement("div", { className: "module-typing-animation__spacer" }),
        react_1.default.createElement("div", { className: classnames_1.default('module-typing-animation__dot', 'module-typing-animation__dot--third', color ? `module-typing-animation__dot--${color}` : null) })));
})();