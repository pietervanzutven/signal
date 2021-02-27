(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.UpdateDialog = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const moment_1 = __importDefault(window.moment);
    const Dialogs_1 = window.ts.types.Dialogs;
    const Intl_1 = window.ts.components.Intl;
    const SNOOZE_TIMER = 60 * 1000 * 30;
    function handleSnooze(setSnoozeForLater) {
        setSnoozeForLater(moment_1.default().add(SNOOZE_TIMER));
        setTimeout(() => {
            setSnoozeForLater(moment_1.default());
        }, SNOOZE_TIMER);
    }
    function canSnooze(snoozeUntil) {
        return snoozeUntil === null;
    }
    function isSnoozed(snoozeUntil) {
        if (snoozeUntil === null) {
            return false;
        }
        return moment_1.default().isBefore(snoozeUntil);
    }
    exports.UpdateDialog = ({ ackRender, dialogType, dismissDialog, hasNetworkDialog, i18n, startUpdate, }) => {
        const [snoozeUntil, setSnoozeForLater] = react_1.default.useState(null);
        react_1.default.useEffect(() => {
            ackRender();
        });
        if (hasNetworkDialog) {
            return null;
        }
        if (dialogType === Dialogs_1.Dialogs.None || isSnoozed(snoozeUntil)) {
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
                            components: [
                                react_1.default.createElement("strong", { key: "app" }, "Signal.app"),
                                react_1.default.createElement("strong", { key: "folder" }, "/Applications"),
                            ], i18n: i18n, id: "readOnlyVolume"
                        }))),
                react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                    react_1.default.createElement("button", { onClick: dismissDialog }, i18n('ok')))));
        }
        return (react_1.default.createElement("div", { className: "module-left-pane-dialog" },
            react_1.default.createElement("div", { className: "module-left-pane-dialog__message" },
                react_1.default.createElement("h3", null, i18n('autoUpdateNewVersionTitle')),
                react_1.default.createElement("span", null, i18n('autoUpdateNewVersionMessage'))),
            react_1.default.createElement("div", { className: "module-left-pane-dialog__actions" },
                canSnooze(snoozeUntil) && (react_1.default.createElement("button", {
                    className: "module-left-pane-dialog__button--no-border", onClick: () => {
                        handleSnooze(setSnoozeForLater);
                    }
                }, i18n('autoUpdateLaterButtonLabel'))),
                react_1.default.createElement("button", { onClick: startUpdate }, i18n('autoUpdateRestartButtonLabel')))));
    };
})();