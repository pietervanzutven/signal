(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.TimerNotification = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    // import classNames from 'classnames';
    const ContactName_1 = window.ts.components.conversation.ContactName;
    const Intl_1 = window.ts.components.Intl;
    const missingCaseError_1 = window.ts.util.missingCaseError;
    class TimerNotification extends react_1.default.Component {
        renderContents() {
            const { i18n, name, phoneNumber, profileName, timespan, type } = this.props;
            switch (type) {
                case 'fromOther':
                    return (react_1.default.createElement(Intl_1.Intl, {
                        i18n: i18n, id: "theyChangedTheTimer", components: [
                            react_1.default.createElement(ContactName_1.ContactName, { i18n: i18n, key: "external-1", phoneNumber: phoneNumber, profileName: profileName, name: name }),
                            timespan,
                        ]
                    }));
                case 'fromMe':
                    return i18n('youChangedTheTimer', [timespan]);
                case 'fromSync':
                    return i18n('timerSetOnSync', [timespan]);
                default:
                    throw missingCaseError_1.missingCaseError(type);
            }
        }
        render() {
            const { timespan } = this.props;
            return (react_1.default.createElement("div", { className: "module-timer-notification" },
                react_1.default.createElement("div", { className: "module-timer-notification__icon-container" },
                    react_1.default.createElement("div", { className: "module-timer-notification__icon" }),
                    react_1.default.createElement("div", { className: "module-timer-notification__icon-label" }, timespan)),
                react_1.default.createElement("div", { className: "module-timer-notification__message" }, this.renderContents())));
        }
    }
    exports.TimerNotification = TimerNotification;
})();