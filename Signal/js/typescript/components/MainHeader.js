(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.MainHeader = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const Avatar_1 = window.ts.components.Avatar;
    class MainHeader extends react_1.default.Component {
        render() {
            const { avatarPath, i18n, color, name, phoneNumber, profileName, } = this.props;
            return (react_1.default.createElement("div", { className: "module-main-header" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28 }),
                react_1.default.createElement("div", { className: "module-main-header__app-name" }, "Signal")));
        }
    }
    exports.MainHeader = MainHeader;
})();