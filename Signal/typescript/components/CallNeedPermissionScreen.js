require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importStar(require("react"));
    const Avatar_1 = require("./Avatar");
    const Intl_1 = require("./Intl");
    const ContactName_1 = require("./conversation/ContactName");
    const AUTO_CLOSE_MS = 10000;
    exports.CallNeedPermissionScreen = ({ conversation, i18n, close, }) => {
        const title = conversation.title || i18n('unknownContact');
        const autoCloseAtRef = react_1.useRef(Date.now() + AUTO_CLOSE_MS);
        react_1.useEffect(() => {
            const timeout = setTimeout(close, autoCloseAtRef.current - Date.now());
            return clearTimeout.bind(null, timeout);
        }, [autoCloseAtRef, close]);
        return (react_1.default.createElement("div", { className: "module-call-need-permission-screen" },
            react_1.default.createElement(Avatar_1.Avatar, { avatarPath: conversation.avatarPath, color: conversation.color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: conversation.name, phoneNumber: conversation.phoneNumber, profileName: conversation.profileName, title: conversation.title, size: 112 }),
            react_1.default.createElement("p", { className: "module-call-need-permission-screen__text" },
                react_1.default.createElement(Intl_1.Intl, { i18n: i18n, id: "callNeedPermission", components: [react_1.default.createElement(ContactName_1.ContactName, { i18n: i18n, title: title })] })),
            react_1.default.createElement("button", {
                type: "button", className: "module-call-need-permission-screen__button", onClick: () => {
                    close();
                }
            }, i18n('close'))));
    };
});