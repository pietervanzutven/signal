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
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const EmojiButton_1 = window.ts.components.emoji.EmojiButton;
    const StickerButton_1 = window.ts.components.stickers.StickerButton;
    const CompositionInput_1 = window.ts.components.CompositionInput;
    const lib_1 = window.ts.components.stickers.lib;
    // tslint:disable-next-line max-func-body-length
    exports.CompositionArea = ({ i18n,
        // CompositionInput
        onDirtyChange, onSubmit, compositionApi, onEditorSizeChange, onEditorStateChange,
        // EmojiButton
        onPickEmoji, onSetSkinTone, recentEmojis, skinTone,
        // StickerButton
        knownPacks, receivedPacks, installedPacks, blessedPacks, recentStickers, clearInstalledStickerPack, onClickAddPack, onPickSticker, clearShowIntroduction, showPickerHint, clearShowPickerHint, }) => {
        const [disabled, setDisabled] = React.useState(false);
        const editorRef = React.useRef(null);
        const inputApiRef = React.useRef();
        const handleForceSend = React.useCallback(() => {
            if (inputApiRef.current) {
                inputApiRef.current.submit();
            }
        }, [inputApiRef]);
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
        if (compositionApi) {
            compositionApi.current = {
                focusInput,
                setDisabled,
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
        return (React.createElement("div", { className: "module-composition-area" },
            React.createElement("div", { className: "module-composition-area__button-cell" },
                React.createElement(EmojiButton_1.EmojiButton, { i18n: i18n, doSend: handleForceSend, onPickEmoji: insertEmoji, recentEmojis: recentEmojis, skinTone: skinTone, onSetSkinTone: onSetSkinTone, onClose: focusInput })),
            React.createElement("div", { className: "module-composition-area__input" },
                React.createElement(CompositionInput_1.CompositionInput, { i18n: i18n, disabled: disabled, editorRef: editorRef, inputApi: inputApiRef, onPickEmoji: onPickEmoji, onSubmit: onSubmit, onEditorSizeChange: onEditorSizeChange, onEditorStateChange: onEditorStateChange, onDirtyChange: onDirtyChange, skinTone: skinTone })),
            withStickers ? (React.createElement("div", { className: "module-composition-area__button-cell" },
                React.createElement(StickerButton_1.StickerButton, { i18n: i18n, knownPacks: knownPacks, receivedPacks: receivedPacks, installedPacks: installedPacks, blessedPacks: blessedPacks, recentStickers: recentStickers, clearInstalledStickerPack: clearInstalledStickerPack, onClickAddPack: onClickAddPack, onPickSticker: onPickSticker, clearShowIntroduction: clearShowIntroduction, showPickerHint: showPickerHint, clearShowPickerHint: clearShowPickerHint }))) : null));
    };
})();