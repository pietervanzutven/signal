require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_dom_1 = require("react-dom");
    const Avatar_1 = require("../Avatar");
    exports.ContactModal = ({ areWeAdmin, contact, i18n, isMember, onClose, openConversation, removeMember, showSafetyNumber, }) => {
        if (!contact) {
            throw new Error('Contact modal opened without a matching contact');
        }
        const [root, setRoot] = react_1.default.useState(null);
        const overlayRef = react_1.default.useRef(null);
        const closeButtonRef = react_1.default.useRef(null);
        react_1.default.useEffect(() => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            setRoot(div);
            return () => {
                document.body.removeChild(div);
                setRoot(null);
            };
        }, []);
        react_1.default.useEffect(() => {
            if (root !== null && closeButtonRef.current) {
                closeButtonRef.current.focus();
            }
        }, [root]);
        react_1.default.useEffect(() => {
            const handler = (event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopPropagation();
                    onClose();
                }
            };
            document.addEventListener('keyup', handler);
            return () => {
                document.removeEventListener('keyup', handler);
            };
        }, [onClose]);
        const onClickOverlay = (e) => {
            if (e.target === overlayRef.current) {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };
        return root
            ? react_dom_1.createPortal(react_1.default.createElement("div", {
                ref: ref => {
                    overlayRef.current = ref;
                }, role: "presentation", className: "module-contact-modal__overlay", onClick: onClickOverlay
            },
                react_1.default.createElement("div", { className: "module-contact-modal" },
                    react_1.default.createElement("button", {
                        ref: r => {
                            closeButtonRef.current = r;
                        }, type: "button", className: "module-contact-modal__close-button", onClick: onClose, "aria-label": i18n('close')
                    }),
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: contact.avatarPath, color: contact.color, conversationType: "direct", i18n: i18n, name: contact.name, profileName: contact.profileName, size: 96, title: contact.title }),
                    react_1.default.createElement("div", { className: "module-contact-modal__name" }, contact.title),
                    contact.phoneNumber && (react_1.default.createElement("div", { className: "module-contact-modal__profile-and-number" }, contact.phoneNumber)),
                    react_1.default.createElement("div", { className: "module-contact-modal__button-container" },
                        react_1.default.createElement("button", { type: "button", className: "module-contact-modal__button module-contact-modal__send-message", onClick: () => openConversation(contact.id) },
                            react_1.default.createElement("div", { className: "module-contact-modal__bubble-icon" },
                                react_1.default.createElement("div", { className: "module-contact-modal__send-message__bubble-icon" })),
                            react_1.default.createElement("span", null, i18n('ContactModal--message'))),
                        !contact.isMe && (react_1.default.createElement("button", { type: "button", className: "module-contact-modal__button module-contact-modal__safety-number", onClick: () => showSafetyNumber(contact.id) },
                            react_1.default.createElement("div", { className: "module-contact-modal__bubble-icon" },
                                react_1.default.createElement("div", { className: "module-contact-modal__safety-number__bubble-icon" })),
                            react_1.default.createElement("span", null, i18n('showSafetyNumber')))),
                        !contact.isMe && areWeAdmin && isMember && (react_1.default.createElement("button", { type: "button", className: "module-contact-modal__button module-contact-modal__remove-from-group", onClick: () => removeMember(contact.id) },
                            react_1.default.createElement("div", { className: "module-contact-modal__bubble-icon" },
                                react_1.default.createElement("div", { className: "module-contact-modal__remove-from-group__bubble-icon" })),
                            react_1.default.createElement("span", null, i18n('ContactModal--remove-from-group'))))))), root)
            : null;
    };
});