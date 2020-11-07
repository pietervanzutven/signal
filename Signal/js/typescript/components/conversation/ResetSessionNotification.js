(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.ResetSessionNotification = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    class ResetSessionNotification extends react_1.default.Component {
        render() {
            const { i18n } = this.props;
            return (react_1.default.createElement("div", { className: "module-reset-session-notification" }, i18n('sessionEnded')));
        }
    }
    exports.ResetSessionNotification = ResetSessionNotification;
})();