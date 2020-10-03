(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Notification = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    class Notification extends react_1.default.Component {
        renderContents() {
            const { type } = this.props;
            return react_1.default.createElement("span", null,
                "Notification of type ",
                type);
        }
        render() {
            const { onClick } = this.props;
            return (react_1.default.createElement("div", { role: "button", onClick: onClick, className: classnames_1.default('module-notification', onClick ? 'module-notification--with-click-handler' : null) }, this.renderContents()));
        }
    }
    exports.Notification = Notification;
})();