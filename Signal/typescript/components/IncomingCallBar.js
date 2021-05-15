require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_tooltip_lite_1 = __importDefault(require("react-tooltip-lite"));
    const Avatar_1 = require("./Avatar");
    const ContactName_1 = require("./conversation/ContactName");
    const CallButton = ({ classSuffix, onClick, tabIndex, tooltipContent, }) => {
        return (react_1.default.createElement("button", { className: `module-incoming-call__button module-incoming-call__button--${classSuffix}`, onClick: onClick, tabIndex: tabIndex, type: "button" },
            react_1.default.createElement(react_tooltip_lite_1.default, { arrowSize: 6, content: tooltipContent, direction: "bottom", distance: 16, hoverDelay: 0 },
                react_1.default.createElement("div", null))));
    };
    exports.IncomingCallBar = ({ acceptCall, callDetails, declineCall, i18n, }) => {
        if (!callDetails) {
            return null;
        }
        const { avatarPath, callId, color, title, name, phoneNumber, profileName, } = callDetails;
        return (react_1.default.createElement("div", { className: "module-incoming-call" },
            react_1.default.createElement("div", { className: "module-incoming-call__contact" },
                react_1.default.createElement("div", { className: "module-incoming-call__contact--avatar" },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 52 })),
                react_1.default.createElement("div", { className: "module-incoming-call__contact--name" },
                    react_1.default.createElement("div", { className: "module-incoming-call__contact--name-header" },
                        react_1.default.createElement(ContactName_1.ContactName, { name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, i18n: i18n })),
                    react_1.default.createElement("div", { dir: "auto", className: "module-incoming-call__contact--message-text" }, i18n(callDetails.isVideoCall
                        ? 'incomingVideoCall'
                        : 'incomingAudioCall')))),
            react_1.default.createElement("div", { className: "module-incoming-call__actions" }, callDetails.isVideoCall ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(CallButton, {
                    classSuffix: "decline", onClick: () => {
                        declineCall({ callId });
                    }, tabIndex: 0, tooltipContent: i18n('declineCall')
                }),
                react_1.default.createElement(CallButton, {
                    classSuffix: "accept-video-as-audio", onClick: () => {
                        acceptCall({ callId, asVideoCall: false });
                    }, tabIndex: 0, tooltipContent: i18n('acceptCallWithoutVideo')
                }),
                react_1.default.createElement(CallButton, {
                    classSuffix: "accept-video", onClick: () => {
                        acceptCall({ callId, asVideoCall: true });
                    }, tabIndex: 0, tooltipContent: i18n('acceptCall')
                }))) : (react_1.default.createElement(react_1.default.Fragment, null,
                    react_1.default.createElement(CallButton, {
                        classSuffix: "decline", onClick: () => {
                            declineCall({ callId });
                        }, tabIndex: 0, tooltipContent: i18n('declineCall')
                    }),
                    react_1.default.createElement(CallButton, {
                        classSuffix: "accept-audio", onClick: () => {
                            acceptCall({ callId, asVideoCall: false });
                        }, tabIndex: 0, tooltipContent: i18n('acceptCall')
                    }))))));
    };
});