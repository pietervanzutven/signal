require(exports => {
    "use strict";
    // Copyright 2020-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CallingHeader = void 0;
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Tooltip_1 = require("./Tooltip");
    const theme_1 = require("../util/theme");
    const CallingHeader = ({ canPip = false, i18n, isInSpeakerView, isGroupCall = false, message, participantCount, showParticipantsList, title, toggleParticipants, togglePip, toggleSettings, toggleSpeakerView, }) => (react_1.default.createElement("div", { className: "module-calling__header" },
        title ? (react_1.default.createElement("div", { className: "module-calling__header--header-name" }, title)) : null,
        message ? (react_1.default.createElement("div", { className: "module-ongoing-call__header-message" }, message)) : null,
        react_1.default.createElement("div", { className: "module-calling-tools" },
            isGroupCall ? (react_1.default.createElement("div", { className: "module-calling-tools__button" },
                react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('calling__participants', [String(participantCount)]), theme: theme_1.Theme.Dark },
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
                react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('callingDeviceSelection__settings'), theme: theme_1.Theme.Dark },
                    react_1.default.createElement("button", { "aria-label": i18n('callingDeviceSelection__settings'), className: "module-calling-button__settings", onClick: toggleSettings, type: "button" }))),
            isGroupCall && participantCount > 2 && toggleSpeakerView && (react_1.default.createElement("div", { className: "module-calling-tools__button" },
                react_1.default.createElement(Tooltip_1.Tooltip, {
                    content: i18n(isInSpeakerView
                        ? 'calling__switch-view--to-grid'
                        : 'calling__switch-view--to-speaker'), theme: theme_1.Theme.Dark
                },
                    react_1.default.createElement("button", {
                        "aria-label": i18n(isInSpeakerView
                            ? 'calling__switch-view--to-grid'
                            : 'calling__switch-view--to-speaker'), className: isInSpeakerView
                                ? 'module-calling-button__grid-view'
                                : 'module-calling-button__speaker-view', onClick: toggleSpeakerView, type: "button"
                    })))),
            canPip && (react_1.default.createElement("div", { className: "module-calling-tools__button" },
                react_1.default.createElement(Tooltip_1.Tooltip, { content: i18n('calling__pip--on'), theme: theme_1.Theme.Dark },
                    react_1.default.createElement("button", { "aria-label": i18n('calling__pip--on'), className: "module-calling-button__pip", onClick: togglePip, type: "button" })))))));
    exports.CallingHeader = CallingHeader;
});