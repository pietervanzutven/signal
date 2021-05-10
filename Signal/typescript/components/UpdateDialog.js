(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.UpdateDialog = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Dialogs_1 = require("../types/Dialogs");
    const Intl_1 = require("./Intl");
    exports.UpdateDialog = ({ ackRender, dialogType, didSnooze, dismissDialog, hasNetworkDialog, i18n, snoozeUpdate, startUpdate, }) => {
        react_1.default.useEffect(() => {
            ackRender();
        });
        if (hasNetworkDialog) {
            return null;
        }
        if (dialogType === Dialogs_1.Dialogs.None) {
            return null;
        }
        if (dialogType === Dialogs_1.Dialogs.Cannot_Update) {
            return (react_1.default.createElement("div", { className: "module-left-pane-dialog module-left-pane-dialog--warning" },
                react_1.default.createElement("div", { className: "module-left-pane-dialog__message" },
                    react_1.default.createElement("h3", null, i18n('cannotUpdate')),
                    react_1.default.createElement("span", null,
                        react_1.default.createElement(Intl_1.Intl, {
                            components: [
                                react_1.default.createElement("a", { key: "signal-download", href: "https://signal.org/download/", rel: "noreferrer", target: "_blank" }, "https://signal.org/download/"),
                            ], i18n: i18n, id: "cannotUpdateDetail"
                        })))));
        }
        if (dialogType === Dialogs_1.Dialogs.MacOS_Read_Only) {
            return (react_1.default.createElement("div", { className: "module-left-pane-dialog module-left-pane-dialog--warning" },
                react_1.default.createElement("div", { className: "module-left-pane-dialog__message" },
                    react_1.default.createElement("h3", null, i18n('cannotUpdate')),
                    react_1.default.createElement("span", null,
                        react_1.default.createElement(Intl_1.Intl, {
                            components: {
                                app: react_1.default.createElement("strong", { key: "app" }, "Signal.app"),
                                folder: react_1.default.createElement("strong", { key: "folder" }, "/Applications"),
                            }, i18n: i18n, id: "readOnlyVolume"
                        }))),
                react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                    react_1.default.createElement("button", { type: "button", onClick: dismissDialog }, i18n('ok')))));
        }
        return (react_1.default.createElement("div", { className: "module-left-pane-dialog" },
            react_1.default.createElement("div", { className: "module-left-pane-dialog__message" },
                react_1.default.createElement("h3", null, i18n('autoUpdateNewVersionTitle')),
                react_1.default.createElement("span", null, i18n('autoUpdateNewVersionMessage'))),
            react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                !didSnooze && (react_1.default.createElement("button", { type: "button", className: "module-left-pane-dialog__button--no-border", onClick: snoozeUpdate }, i18n('autoUpdateLaterButtonLabel'))),
                react_1.default.createElement("button", { type: "button", onClick: startUpdate }, i18n('autoUpdateRestartButtonLabel')))));
    };
})();