require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable react/no-array-index-key */
    const react_1 = __importDefault(require("react"));
    const react_dom_1 = require("react-dom");
    const Avatar_1 = require("./Avatar");
    const ContactName_1 = require("./conversation/ContactName");
    exports.CallingParticipantsList = react_1.default.memo(({ i18n, onClose, participants }) => {
        const [root, setRoot] = react_1.default.useState(null);
        react_1.default.useEffect(() => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            setRoot(div);
            return () => {
                document.body.removeChild(div);
                setRoot(null);
            };
        }, []);
        if (!root) {
            return null;
        }
        return react_dom_1.createPortal(react_1.default.createElement("div", { role: "presentation", className: "module-calling-participants-list__overlay" },
            react_1.default.createElement("div", { className: "module-calling-participants-list" },
                react_1.default.createElement("div", { className: "module-calling-participants-list__header" },
                    react_1.default.createElement("div", { className: "module-calling-participants-list__title" },
                        !participants.length && i18n('calling__in-this-call--zero'),
                        participants.length === 1 && i18n('calling__in-this-call--one'),
                        participants.length > 1 &&
                        i18n('calling__in-this-call--many', [
                            String(participants.length),
                        ])),
                    react_1.default.createElement("button", { type: "button", className: "module-calling-participants-list__close", onClick: onClose, tabIndex: 0, "aria-label": i18n('close') })),
                react_1.default.createElement("ul", { className: "module-calling-participants-list__list" }, participants.map((participant, index) => (react_1.default.createElement("li", { className: "module-calling-participants-list__contact", key: index },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement(Avatar_1.Avatar, { avatarPath: participant.avatarPath, color: participant.color, conversationType: "direct", i18n: i18n, profileName: participant.profileName, title: participant.title, size: 32 }),
                        participant.isSelf ? (react_1.default.createElement("span", { className: "module-calling-participants-list__name" }, i18n('you'))) : (react_1.default.createElement(ContactName_1.ContactName, { i18n: i18n, module: "module-calling-participants-list__name", title: participant.title }))),
                    react_1.default.createElement("div", null,
                        !participant.hasRemoteAudio ? (react_1.default.createElement("span", { className: "module-calling-participants-list__muted--audio" })) : null,
                        !participant.hasRemoteVideo ? (react_1.default.createElement("span", { className: "module-calling-participants-list__muted--video" })) : null))))))), root);
    });
});