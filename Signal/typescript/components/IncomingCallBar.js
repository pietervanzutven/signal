require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Avatar_1 = require("./Avatar");
    const Tooltip_1 = require("./Tooltip");
    const theme_1 = require("../util/theme");
    const ContactName_1 = require("./conversation/ContactName");
    const CallButton = ({ classSuffix, onClick, tabIndex, tooltipContent, }) => {
        return (react_1.default.createElement(Tooltip_1.Tooltip, { content: tooltipContent, theme: theme_1.Theme.Dark },
            react_1.default.createElement("button", { className: `module-incoming-call__button module-incoming-call__button--${classSuffix}`, onClick: onClick, tabIndex: tabIndex, type: "button" },
                react_1.default.createElement("div", null))));
    };
    exports.IncomingCallBar = ({ acceptCall, declineCall, i18n, call, conversation, }) => {
        const { isVideoCall } = call;
        const { id: conversationId, avatarPath, color, title, name, phoneNumber, profileName, } = conversation;
        return (react_1.default.createElement("div", { className: "module-incoming-call" },
            react_1.default.createElement("div", { className: "module-incoming-call__contact" },
                react_1.default.createElement("div", { className: "module-incoming-call__contact--avatar" },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 })),
                react_1.default.createElement("div", { className: "module-incoming-call__contact--name" },
                    react_1.default.createElement("div", { className: "module-incoming-call__contact--name-header" },
                        react_1.default.createElement(ContactName_1.ContactName, { name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, i18n: i18n })),
                    react_1.default.createElement("div", { dir: "auto", className: "module-incoming-call__contact--message-text" }, i18n(isVideoCall ? 'incomingVideoCall' : 'incomingAudioCall')))),
            react_1.default.createElement("div", { className: "module-incoming-call__actions" }, isVideoCall ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallButton, {
                    classSuffix: "decline", onClick: () => {
                        declineCall({ conversationId });
                    }, tabIndex: 0, tooltipContent: i18n('declineCall')
                }),
                react_1.default.createElement(CallButton, {
                    classSuffix: "accept-video-as-audio", onClick: () => {
                        acceptCall({ conversationId, asVideoCall: false });
                    }, tabIndex: 0, tooltipContent: i18n('acceptCallWithoutVideo')
                }),
                react_1.default.createElement(CallButton, {
                    classSuffix: "accept-video", onClick: () => {
                        acceptCall({ conversationId, asVideoCall: true });
                    }, tabIndex: 0, tooltipContent: i18n('acceptCall')
                }))) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(CallButton, {
                        classSuffix: "decline", onClick: () => {
                            declineCall({ conversationId });
                        }, tabIndex: 0, tooltipContent: i18n('declineCall')
                    }),
                    react_1.default.createElement(CallButton, {
                        classSuffix: "accept-audio", onClick: () => {
                            acceptCall({ conversationId, asVideoCall: false });
                        }, tabIndex: 0, tooltipContent: i18n('acceptCall')
                    }))))));
    };
});