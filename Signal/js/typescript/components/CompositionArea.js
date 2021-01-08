(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.CompositionArea = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const lodash_1 = window.lodash;
    const classnames_1 = __importDefault(window.classnames);
    const EmojiButton_1 = window.ts.components.emoji.EmojiButton;
    const StickerButton_1 = window.ts.components.stickers.StickerButton;
    const CompositionInput_1 = window.ts.components.CompositionInput;
    const lib_1 = window.ts.components.stickers.lib;
    const emptyElement = (el) => {
        // tslint:disable-next-line no-inner-html
        el.innerHTML = '';
    };
    // tslint:disable-next-line max-func-body-length
    exports.CompositionArea = ({ i18n, attachmentListEl, micCellEl, attCellEl,
        // CompositionInput
        onSubmit, compositionApi, onEditorSizeChange, onEditorStateChange,
        // EmojiButton
        onPickEmoji, onSetSkinTone, recentEmojis, skinTone,
        // StickerButton
        knownPacks, receivedPacks, installedPacks, blessedPacks, recentStickers, clearInstalledStickerPack, onClickAddPack, onPickSticker, clearShowIntroduction, showPickerHint, clearShowPickerHint, }) => {
        const [disabled, setDisabled] = React.useState(false);
        const [showMic, setShowMic] = React.useState(true);
        const [micActive, setMicActive] = React.useState(false);
        const [dirty, setDirty] = React.useState(false);
        const [large, setLarge] = React.useState(false);
        const editorRef = React.useRef(null);
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
            if (editorRef.current) {
                editorRef.current.focus();
            }
        }, [editorRef]);
        const withStickers = lib_1.countStickers({
            knownPacks,
            blessedPacks,
            installedPacks,
            receivedPacks,
        }) > 0;
        // A ref to grab a slot where backbone can insert link previews and attachments
        const attSlotRef = React.useRef(null);
        if (compositionApi) {
            compositionApi.current = {
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
        const attCellRef = React.useRef(null);
        React.useLayoutEffect(() => {
            const { current: micCellContainer } = micCellRef;
            const { current: attCellContainer } = attCellRef;
            if (micCellContainer && micCellEl) {
                emptyElement(micCellContainer);
                micCellContainer.appendChild(micCellEl);
            }
            if (attCellContainer && attCellEl) {
                emptyElement(attCellContainer);
                attCellContainer.appendChild(attCellEl);
            }
            return lodash_1.noop;
        }, [micCellRef, attCellRef, micCellEl, attCellEl, large, dirty, showMic]);
        React.useLayoutEffect(() => {
            const { current: attSlot } = attSlotRef;
            if (attSlot && attachmentListEl) {
                attSlot.appendChild(attachmentListEl);
            }
            return lodash_1.noop;
        }, [attSlotRef, attachmentListEl]);
        const emojiButtonFragment = (React.createElement("div", { className: "module-composition-area__button-cell" },
            React.createElement(EmojiButton_1.EmojiButton, { i18n: i18n, doSend: handleForceSend, onPickEmoji: insertEmoji, recentEmojis: recentEmojis, skinTone: skinTone, onSetSkinTone: onSetSkinTone, onClose: focusInput })));
        const micButtonFragment = showMic ? (React.createElement("div", { className: classnames_1.default('module-composition-area__button-cell', micActive ? 'module-composition-area__button-cell--mic-active' : null, large ? 'module-composition-area__button-cell--large-right' : null), ref: micCellRef })) : null;
        const attButtonFragment = (React.createElement("div", { className: "module-composition-area__button-cell", ref: attCellRef }));
        const sendButtonFragment = (React.createElement("div", { className: classnames_1.default('module-composition-area__button-cell', large ? 'module-composition-area__button-cell--large-right' : null) },
            React.createElement("button", { className: "module-composition-area__send-button", onClick: handleForceSend })));
        const stickerButtonPlacement = large ? 'top-start' : 'top-end';
        const stickerButtonFragment = withStickers ? (React.createElement("div", { className: "module-composition-area__button-cell" },
            React.createElement(StickerButton_1.StickerButton, { i18n: i18n, knownPacks: knownPacks, receivedPacks: receivedPacks, installedPacks: installedPacks, blessedPacks: blessedPacks, recentStickers: recentStickers, clearInstalledStickerPack: clearInstalledStickerPack, onClickAddPack: onClickAddPack, onPickSticker: onPickSticker, clearShowIntroduction: clearShowIntroduction, showPickerHint: showPickerHint, clearShowPickerHint: clearShowPickerHint, position: stickerButtonPlacement }))) : null;
        return (React.createElement("div", { className: "module-composition-area" },
            React.createElement("div", { className: classnames_1.default('module-composition-area__row', 'module-composition-area__row--center', 'module-composition-area__row--show-on-focus') },
                React.createElement("button", { className: classnames_1.default('module-composition-area__toggle-large', large ? 'module-composition-area__toggle-large--large-active' : null), onClick: handleToggleLarge })),
            React.createElement("div", { className: classnames_1.default('module-composition-area__row', 'module-composition-area__row--column'), ref: attSlotRef }),
            React.createElement("div", { className: classnames_1.default('module-composition-area__row', large ? 'module-composition-area__row--padded' : null) },
                !large ? emojiButtonFragment : null,
                React.createElement("div", { className: "module-composition-area__input" },
                    React.createElement(CompositionInput_1.CompositionInput, { i18n: i18n, disabled: disabled, large: large, editorRef: editorRef, inputApi: inputApiRef, onPickEmoji: onPickEmoji, onSubmit: handleSubmit, onEditorSizeChange: onEditorSizeChange, onEditorStateChange: onEditorStateChange, onDirtyChange: setDirty, skinTone: skinTone })),
                !large ? (React.createElement(React.Fragment, null,
                    stickerButtonFragment,
                    !dirty ? micButtonFragment : null,
                    attButtonFragment)) : null),
            large ? (React.createElement("div", { className: classnames_1.default('module-composition-area__row', 'module-composition-area__row--control-row') },
                emojiButtonFragment,
                stickerButtonFragment,
                attButtonFragment,
                !dirty ? micButtonFragment : null,
                dirty || !showMic ? sendButtonFragment : null)) : null));
    };
})();