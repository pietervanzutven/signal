(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.RelinkDialog = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    exports.RelinkDialog = ({ hasNetworkDialog, i18n, isRegistrationDone, relinkDevice, }) => {
        if (hasNetworkDialog || isRegistrationDone) {
            return null;
        }
        return (react_1.default.createElement("div", { className: "module-left-pane-dialog module-left-pane-dialog--warning" },
            react_1.default.createElement("div", { className: "module-left-pane-dialog__message" },
                react_1.default.createElement("h3", null, i18n('unlinked')),
                react_1.default.createElement("span", null, i18n('unlinkedWarning'))),
            react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                react_1.default.createElement("button", { onClick: relinkDevice }, i18n('relink')))));
    };
})();