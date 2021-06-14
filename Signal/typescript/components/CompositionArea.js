require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CompositionArea = void 0;
    const React = __importStar(require("react"));
    const lodash_1 = require("lodash");
    const classnames_1 = __importDefault(require("classnames"));
    const EmojiButton_1 = require("./emoji/EmojiButton");
    const StickerButton_1 = require("./stickers/StickerButton");
    const CompositionInput_1 = require("./CompositionInput");
    const MessageRequestActions_1 = require("./conversation/MessageRequestActions");
    const GroupV1DisabledActions_1 = require("./conversation/GroupV1DisabledActions");
    const MandatoryProfileSharingActions_1 = require("./conversation/MandatoryProfileSharingActions");
    const lib_1 = require("./stickers/lib");
    const emptyElement = (el) => {
        // Necessary to deal with Backbone views
        // eslint-disable-next-line no-param-reassign
        el.innerHTML = '';
    };
    const CompositionArea = ({ i18n, attachmentListEl, micCellEl, onChooseAttachment,
        // CompositionInput
        onSubmit, compositionApi, onEditorStateChange, onTextTooLong, draftText, draftBodyRanges, clearQuotedMessage, getQuotedMessage, members,
        // EmojiButton
        onPickEmoji, onSetSkinTone, recentEmojis, skinTone,
        // StickerButton
        knownPacks, receivedPacks, installedPack, installedPacks, blessedPacks, recentStickers, clearInstalledStickerPack, onClickAddPack, onPickSticker, clearShowIntroduction, showPickerHint, clearShowPickerHint,
        // Message Requests
        acceptedMessageRequest, areWePending, conversationType, groupVersion, isBlocked, isMissingMandatoryProfileSharing, left, messageRequestsEnabled, name, onAccept, onBlock, onBlockAndDelete, onDelete, onUnblock, phoneNumber, profileName, title,
        // GroupV1 Disabled Actions
        isGroupV1AndDisabled, onStartGroupMigration, }) => {
        const [disabled, setDisabled] = React.useState(false);
        const [showMic, setShowMic] = React.useState(!draftText);
        const [micActive, setMicActive] = React.useState(false);
        const [dirty, setDirty] = React.useState(false);
        const [large, setLarge] = React.useState(false);
        const inputApiRef = React.useRef();
        const handleForceSend = React.useCallback(() => {
            setLarge(false);
            if (inputApiRef.current) {
                inputApiRef.current.submit();
            }
        }, [inputApiRef, setLarge]);
        const handleSubmit = React.useCallback((...args) => {
            setLarge(false);
            onSubmit(...args);
        }, [setLarge, onSubmit]);
        const focusInput = React.useCallback(() => {
            if (inputApiRef.current) {
                inputApiRef.current.focus();
            }
        }, [inputApiRef]);
        const withStickers = lib_1.countStickers({
            knownPacks,
            blessedPacks,
            installedPacks,
            receivedPacks,
        }) > 0;
        // A ref to grab a slot where backbone can insert link previews and attachments
        const attSlotRef = React.useRef(null);
        if (compositionApi) {
            // Using a React.MutableRefObject, so we need to reassign this prop.
            // eslint-disable-next-line no-param-reassign
            compositionApi.current = {
                isDirty: () => dirty,
                focusInput,
                setDisabled,
                setShowMic,
                setMicActive,
                attSlotRef,
                reset: () => {
                    if (inputApiRef.current) {
                        inputApiRef.current.reset();
                    }
                },
                resetEmojiResults: () => {
                    if (inputApiRef.current) {
                        inputApiRef.current.resetEmojiResults();
                    }
                },
            };
        }
        const insertEmoji = React.useCallback((e) => {
            if (inputApiRef.current) {
                inputApiRef.current.insertEmoji(e);
                onPickEmoji(e);
            }
        }, [inputApiRef, onPickEmoji]);
        const handleToggleLarge = React.useCallback(() => {
            setLarge(l => !l);
        }, [setLarge]);
        // The following is a work-around to allow react to lay-out backbone-managed
        // dom nodes until those functions are in React
        const micCellRef = React.useRef(null);
        React.useLayoutEffect(() => {
            const { current: micCellContainer } = micCellRef;
            if (micCellContainer && micCellEl) {
                emptyElement(micCellContainer);
                micCellContainer.appendChild(micCellEl);
            }
            return lodash_1.noop;
        }, [micCellRef, micCellEl, large, dirty, showMic]);
        React.useLayoutEffect(() => {
            const { current: attSlot } = attSlotRef;
            if (attSlot && attachmentListEl) {
                attSlot.appendChild(attachmentListEl);
            }
            return lodash_1.noop;
        }, [attSlotRef, attachmentListEl]);
        const emojiButtonFragment = (React.createElement("div", { className: "module-composition-area__button-cell" },
            React.createElement(EmojiButton_1.EmojiButton, { i18n: i18n, doSend: handleForceSend, onPickEmoji: insertEmoji, recentEmojis: recentEmojis, skinTone: skinTone, onSetSkinTone: onSetSkinTone })));
        const micButtonFragment = showMic ? (React.createElement("div", {
            className: classnames_1.default('module-composition-area__button-cell', micActive ? 'module-composition-area__button-cell--mic-active' : null, large ? 'module-composition-area__button-cell--large-right' : null, micActive && large
                ? 'module-composition-area__button-cell--large-right-mic-active'
                : null), ref: micCellRef
        })) : null;
        const attButton = (React.createElement("div", { className: "module-composition-area__button-cell" },
            React.createElement("div", { className: "choose-file" },
                React.createElement("button", { type: "button", className: "paperclip thumbnail", onClick: onChooseAttachment, "aria-label": i18n('CompositionArea--attach-file') }))));
        const sendButtonFragment = (React.createElement("div", { className: classnames_1.default('module-composition-area__button-cell', large ? 'module-composition-area__button-cell--large-right' : null) },
            React.createElement("button", { type: "button", className: "module-composition-area__send-button", onClick: handleForceSend, "aria-label": i18n('sendMessageToContact') })));
        const stickerButtonPlacement = large ? 'top-start' : 'top-end';
        const stickerButtonFragment = withStickers ? (React.createElement("div", { className: "module-composition-area__button-cell" },
            React.createElement(StickerButton_1.StickerButton, { i18n: i18n, knownPacks: knownPacks, receivedPacks: receivedPacks, installedPack: installedPack, installedPacks: installedPacks, blessedPacks: blessedPacks, recentStickers: recentStickers, clearInstalledStickerPack: clearInstalledStickerPack, onClickAddPack: onClickAddPack, onPickSticker: onPickSticker, clearShowIntroduction: clearShowIntroduction, showPickerHint: showPickerHint, clearShowPickerHint: clearShowPickerHint, position: stickerButtonPlacement }))) : null;
        // Listen for cmd/ctrl-shift-x to toggle large composition mode
        React.useEffect(() => {
            const handler = (e) => {
                const { key, shiftKey, ctrlKey, metaKey } = e;
                // When using the ctrl key, `key` is `'X'`. When using the cmd key, `key` is `'x'`
                const xKey = key === 'x' || key === 'X';
                const commandKey = lodash_1.get(window, 'platform') === 'darwin' && metaKey;
                const controlKey = lodash_1.get(window, 'platform') !== 'darwin' && ctrlKey;
                const commandOrCtrl = commandKey || controlKey;
                // cmd/ctrl-shift-x
                if (xKey && shiftKey && commandOrCtrl) {
                    e.preventDefault();
                    setLarge(x => !x);
                }
            };
            document.addEventListener('keydown', handler);
            return () => {
                document.removeEventListener('keydown', handler);
            };
        }, [setLarge]);
        if (isBlocked ||
            areWePending ||
            (messageRequestsEnabled && !acceptedMessageRequest)) {
            return (React.createElement(MessageRequestActions_1.MessageRequestActions, { i18n: i18n, conversationType: conversationType, isBlocked: isBlocked, onBlock: onBlock, onBlockAndDelete: onBlockAndDelete, onUnblock: onUnblock, onDelete: onDelete, onAccept: onAccept, name: name, profileName: profileName, phoneNumber: phoneNumber, title: title }));
        }
        // If no message request, but we haven't shared profile yet, we show profile-sharing UI
        if (!left &&
            (conversationType === 'direct' ||
                (conversationType === 'group' && groupVersion === 1)) &&
            isMissingMandatoryProfileSharing) {
            return (React.createElement(MandatoryProfileSharingActions_1.MandatoryProfileSharingActions, { i18n: i18n, conversationType: conversationType, onBlock: onBlock, onBlockAndDelete: onBlockAndDelete, onDelete: onDelete, onAccept: onAccept, name: name, profileName: profileName, phoneNumber: phoneNumber, title: title }));
        }
        // If this is a V1 group, now disabled entirely, we show UI to help them upgrade
        if (!left && isGroupV1AndDisabled) {
            return (React.createElement(GroupV1DisabledActions_1.GroupV1DisabledActions, { i18n: i18n, onStartGroupMigration: onStartGroupMigration }));
        }
        return (React.createElement("div", { className: "module-composition-area" },
            React.createElement("div", { className: "module-composition-area__toggle-large" },
                React.createElement("button", {
                    type: "button", className: classnames_1.default('module-composition-area__toggle-large__button', large
                        ? 'module-composition-area__toggle-large__button--large-active'
                        : null),
                    // This prevents the user from tabbing here
                    tabIndex: -1, onClick: handleToggleLarge, "aria-label": i18n('CompositionArea--expand')
                })),
            React.createElement("div", { className: classnames_1.default('module-composition-area__row', 'module-composition-area__row--column'), ref: attSlotRef }),
            React.createElement("div", { className: classnames_1.default('module-composition-area__row', large ? 'module-composition-area__row--padded' : null) },
                !large ? emojiButtonFragment : null,
                React.createElement("div", { className: "module-composition-area__input" },
                    React.createElement(CompositionInput_1.CompositionInput, { i18n: i18n, disabled: disabled, large: large, inputApi: inputApiRef, onPickEmoji: onPickEmoji, onSubmit: handleSubmit, onEditorStateChange: onEditorStateChange, onTextTooLong: onTextTooLong, onDirtyChange: setDirty, skinTone: skinTone, draftText: draftText, draftBodyRanges: draftBodyRanges, clearQuotedMessage: clearQuotedMessage, getQuotedMessage: getQuotedMessage, members: members })),
                !large ? (React.createElement(React.Fragment, null,
                    stickerButtonFragment,
                    !dirty ? micButtonFragment : null,
                    attButton)) : null),
            large ? (React.createElement("div", { className: classnames_1.default('module-composition-area__row', 'module-composition-area__row--control-row') },
                emojiButtonFragment,
                stickerButtonFragment,
                attButton,
                !dirty ? micButtonFragment : null,
                dirty || !showMic ? sendButtonFragment : null)) : null));
    };
    exports.CompositionArea = CompositionArea;
});