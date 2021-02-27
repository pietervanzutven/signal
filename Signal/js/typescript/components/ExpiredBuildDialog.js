(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ExpiredBuildDialog = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    exports.ExpiredBuildDialog = ({ hasExpired, i18n, }) => {
        if (!hasExpired) {
            return null;
        }
        return (react_1.default.createElement("div", { className: "module-left-pane-dialog module-left-pane-dialog--error" },
            i18n('expiredWarning'),
            react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                react_1.default.createElement("a", { className: "module-left-pane-dialog__link", href: "https://signal.org/download/", rel: "noreferrer", tabIndex: -1, target: "_blank" },
                    react_1.default.createElement("button", { className: "upgrade" }, i18n('upgrade'))))));
    };
})();