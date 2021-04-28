require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_tooltip_lite_1 = __importDefault(require("react-tooltip-lite"));
    exports.InContactsIcon = (props) => {
        const { i18n } = props;
        return (react_1.default.createElement(react_tooltip_lite_1.default, { tagName: "span", direction: "bottom", className: "module-in-contacts-icon__tooltip", arrowSize: 8, content: i18n('contactInAddressBook'), distance: 13, hoverDelay: 0 },
            react_1.default.createElement("span", { tabIndex: 0, role: "img", "aria-label": i18n('contactInAddressBook'), className: "module-in-contacts-icon__icon" })));
    };
});