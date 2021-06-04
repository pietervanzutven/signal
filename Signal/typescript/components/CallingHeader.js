require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Tooltip_1 = require("./Tooltip");
    exports.CallingHeader = ({ canPip = false, i18n, isGroupCall = false, message, participantCount, showParticipantsList, title, toggleParticipants, togglePip, toggleSettings, }) => (react_1.default.createElement("div", { className: "module-calling__header" },
        title ? (react_1.default.createElement("div", { className: "module-calling__header--header-name" }, title)) : null,
        message ? (react_1.default.createElement("div", { className: "module-ongoing-call__header-message" }, message)) : null,
        react_1.default.createElement("div", { className: "module-calling-tools" },
            isGroupCall ? (react_1.default.createElement("div", { className: "module-calling-tools__button" },
                react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('calling__participants', [String(participantCount)]), theme: Tooltip_1.TooltipTheme.Dark },
                    react_1.default.createElement("button", {
                        "aria-label": i18n('calling__participants', [
                            String(participantCount),
                        ]), className: classnames_1.default('module-calling-button__participants--container', {
                            'module-calling-button__participants--shown': showParticipantsList,
                        }), onClick: toggleParticipants, type: "button"
                    },
                        react_1.default.createElement("i", { className: "module-calling-button__participants" }),
                        react_1.default.createElement("span", { className: "module-calling-button__participants--count" }, participantCount))))) : null,
            react_1.default.createElement("div", { className: "module-calling-tools__button" },
                react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('callingDeviceSelection__settings'), theme: Tooltip_1.TooltipTheme.Dark },
                    react_1.default.createElement("button", { "aria-label": i18n('callingDeviceSelection__settings'), className: "module-calling-button__settings", onClick: toggleSettings, type: "button" }))),
            canPip && (react_1.default.createElement("div", { className: "module-calling-tools__button" },
                react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('calling__pip--on'), theme: Tooltip_1.TooltipTheme.Dark },
                    react_1.default.createElement("button", { "aria-label": i18n('calling__pip--on'), className: "module-calling-button__pip", onClick: togglePip, type: "button" })))))));
});