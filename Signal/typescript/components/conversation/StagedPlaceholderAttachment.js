(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.StagedPlaceholderAttachment = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    exports.StagedPlaceholderAttachment = ({ i18n, onClick, }) => (react_1.default.createElement("button", { type: "button", className: "module-staged-placeholder-attachment", onClick: onClick, title: i18n('add-image-attachment') },
        react_1.default.createElement("div", { className: "module-staged-placeholder-attachment__plus-icon" })));
})();