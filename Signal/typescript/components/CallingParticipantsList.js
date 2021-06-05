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
    const InContactsIcon_1 = require("./InContactsIcon");
    const sortByTitle_1 = require("../util/sortByTitle");
    exports.CallingParticipantsList = react_1.default.memo(({ i18n, onClose, participants }) => {
        const [root, setRoot] = react_1.default.useState(null);
        const sortedParticipants = react_1.default.useMemo(() => sortByTitle_1.sortByTitle(participants), [participants]);
        react_1.default.useEffect(() => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            setRoot(div);
            return () => {
                document.body.removeChild(div);
                setRoot(null);
            };
        }, []);
        const handleCancel = react_1.default.useCallback((e) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        }, [onClose]);
        if (!root) {
            return null;
        }
        return react_dom_1.createPortal(react_1.default.createElement("div", { className: "module-calling-participants-list__overlay", onClick: handleCancel, role: "presentation" },
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
                react_1.default.createElement("ul", { className: "module-calling-participants-list__list" }, sortedParticipants.map((participant, index) => (react_1.default.createElement("li", {
                    className: "module-calling-participants-list__contact",
                    // It's tempting to use `participant.uuid` as the `key` here, but that
                    //   can result in duplicate keys for participants who have joined on
                    //   multiple devices.
                    key: index
                },
                    react_1.default.createElement("div", null,
                        react_1.default.createElement(Avatar_1.Avatar, { avatarPath: participant.avatarPath, color: participant.color, conversationType: "direct", i18n: i18n, profileName: participant.profileName, title: participant.title, size: 32 }),
                        participant.isSelf ? (react_1.default.createElement("span", { className: "module-calling-participants-list__name" }, i18n('you'))) : (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(ContactName_1.ContactName, { i18n: i18n, module: "module-calling-participants-list__name", title: participant.title }),
                            participant.name ? (react_1.default.createElement("span", null,
                                ' ',
                                react_1.default.createElement(InContactsIcon_1.InContactsIcon, { className: "module-calling-participants-list__contact-icon", i18n: i18n }))) : null))),
                    react_1.default.createElement("div", null,
                        participant.hasAudio === false ? (react_1.default.createElement("span", { className: "module-calling-participants-list__muted--audio" })) : null,
                        participant.hasVideo === false ? (react_1.default.createElement("span", { className: "module-calling-participants-list__muted--video" })) : null))))))), root);
    });
});