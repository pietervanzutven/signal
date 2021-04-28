(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.AvatarPopup = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Avatar_1 = require("./Avatar");
    const hooks_1 = require("../util/hooks");
    exports.AvatarPopup = (props) => {
        const focusRef = React.useRef(null);
        const { i18n, name, profileName, phoneNumber, title, onViewPreferences, onViewArchive, style, } = props;
        const shouldShowNumber = Boolean(name || profileName);
        // Note: mechanisms to dismiss this view are all in its host, MainHeader
        // Focus first button after initial render, restore focus on teardown
        hooks_1.useRestoreFocus(focusRef);
        return (React.createElement("div", { style: style, className: "module-avatar-popup" },
            React.createElement("div", { className: "module-avatar-popup__profile" },
                React.createElement(Avatar_1.Avatar, Object.assign({}, props, { size: 52 })),
                React.createElement("div", { className: "module-avatar-popup__profile__text" },
                    React.createElement("div", { className: "module-avatar-popup__profile__name" }, title),
                    shouldShowNumber ? (React.createElement("div", { className: "module-avatar-popup__profile__number" }, phoneNumber)) : null)),
            React.createElement("hr", { className: "module-avatar-popup__divider" }),
            React.createElement("button", { ref: focusRef, className: "module-avatar-popup__item", onClick: onViewPreferences },
                React.createElement("div", { className: classnames_1.default('module-avatar-popup__item__icon', 'module-avatar-popup__item__icon-settings') }),
                React.createElement("div", { className: "module-avatar-popup__item__text" }, i18n('mainMenuSettings'))),
            React.createElement("button", { className: "module-avatar-popup__item", onClick: onViewArchive },
                React.createElement("div", { className: classnames_1.default('module-avatar-popup__item__icon', 'module-avatar-popup__item__icon-archive') }),
                React.createElement("div", { className: "module-avatar-popup__item__text" }, i18n('avatarMenuViewArchive')))));
    };
})();