require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Tooltip_1 = require("./Tooltip");
    exports.InContactsIcon = (props) => {
        const { i18n } = props;
        /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
        return (react_1.default.createElement("span", { className: "module-in-contacts-icon__tooltip" },
            react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('contactInAddressBook') },
                react_1.default.createElement("span", { tabIndex: 0, role: "img", "aria-label": i18n('contactInAddressBook'), className: "module-in-contacts-icon__icon" }))));
        /* eslint-enable jsx-a11y/no-noninteractive-tabindex */
    };
});