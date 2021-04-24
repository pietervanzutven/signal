(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.LastSeenIndicator = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    class LastSeenIndicator extends react_1.default.Component {
        render() {
            const { count, i18n } = this.props;
            const message = count === 1
                ? i18n('unreadMessage')
                : i18n('unreadMessages', [String(count)]);
            return (react_1.default.createElement("div", { className: "module-last-seen-indicator" },
                react_1.default.createElement("div", { className: "module-last-seen-indicator__bar" }),
                react_1.default.createElement("div", { className: "module-last-seen-indicator__text" }, message)));
        }
    }
    exports.LastSeenIndicator = LastSeenIndicator;
})();