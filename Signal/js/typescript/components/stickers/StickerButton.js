(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerButton = {};

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
    const classnames_1 = __importDefault(window.classnames);
    const lodash_1 = window.lodash;
    const react_popper_1 = window.react_popper;
    const react_dom_1 = window.react_dom;
    const StickerPicker_1 = window.ts.components.stickers.StickerPicker;
    exports.StickerButton = React.memo(
        // tslint:disable-next-line max-func-body-length
        ({ i18n, clearInstalledStickerPack, onClickAddPack, onPickSticker, recentStickers, receivedPacks, installedPack, installedPacks, showIntroduction, clearShowIntroduction, showPickerHint, clearShowPickerHint, }) => {
            const [open, setOpen] = React.useState(false);
            const [popperRoot, setPopperRoot] = React.useState(null);
            const handleClickButton = React.useCallback(() => {
                // Clear tooltip state
                clearInstalledStickerPack();
                // Handle button click
                if (installedPacks.length === 0) {
                    onClickAddPack();
                }
                else if (popperRoot) {
                    setOpen(false);
                }
                else {
                    setOpen(true);
                }
            }, [
                clearInstalledStickerPack,
                onClickAddPack,
                installedPacks,
                popperRoot,
                setOpen,
            ]);
            const handlePickSticker = React.useCallback((packId, stickerId) => {
                setOpen(false);
                onPickSticker(packId, stickerId);
            }, [setOpen, onPickSticker]);
            const handleClickAddPack = React.useCallback(() => {
                setOpen(false);
                if (showPickerHint) {
                    clearShowPickerHint();
                }
                onClickAddPack();
            }, [onClickAddPack, showPickerHint, clearShowPickerHint]);
            const handleClearIntroduction = React.useCallback(() => {
                clearInstalledStickerPack();
                clearShowIntroduction();
            }, [clearInstalledStickerPack, clearShowIntroduction]);
            // Create popper root and handle outside clicks
            React.useEffect(() => {
                if (open) {
                    const root = document.createElement('div');
                    setPopperRoot(root);
                    document.body.appendChild(root);
                    const handleOutsideClick = ({ target }) => {
                        if (!root.contains(target)) {
                            setOpen(false);
                        }
                    };
                    document.addEventListener('click', handleOutsideClick);
                    return () => {
                        document.body.removeChild(root);
                        document.removeEventListener('click', handleOutsideClick);
                        setPopperRoot(null);
                    };
                }
                return lodash_1.noop;
            }, [open, setOpen, setPopperRoot]);
            // Clear the installed pack after one minute
            React.useEffect(() => {
                if (installedPack) {
                    // tslint:disable-next-line:no-string-based-set-timeout
                    const timerId = setTimeout(clearInstalledStickerPack, 60 * 1000);
                    return () => {
                        clearTimeout(timerId);
                    };
                }
                return lodash_1.noop;
            }, [installedPack, clearInstalledStickerPack]);
            if (installedPacks.length + receivedPacks.length === 0) {
                return null;
            }
            return (React.createElement(react_popper_1.Manager, null,
                React.createElement(react_popper_1.Reference, null, ({ ref }) => (React.createElement("button", {
                    ref: ref, onClick: handleClickButton, className: classnames_1.default({
                        'module-sticker-button__button': true,
                        'module-sticker-button__button--active': open,
                    })
                }))),
                !open && !showIntroduction && installedPack ? (React.createElement(react_popper_1.Popper, { placement: "top-end", key: installedPack.id }, ({ ref, style, placement, arrowProps }) => (React.createElement("div", { ref: ref, style: style, className: "module-sticker-button__tooltip", role: "button", onClick: clearInstalledStickerPack },
                    React.createElement("img", { className: "module-sticker-button__tooltip__image", src: installedPack.cover.url, alt: installedPack.title }),
                    React.createElement("span", { className: "module-sticker-button__tooltip__text" },
                        React.createElement("span", { className: "module-sticker-button__tooltip__text__title" }, installedPack.title),
                        ' ',
                        "installed"),
                    React.createElement("div", { ref: arrowProps.ref, style: arrowProps.style, className: classnames_1.default('module-sticker-button__tooltip__triangle', `module-sticker-button__tooltip__triangle--${placement}`) }))))) : null,
                !open && showIntroduction ? (React.createElement(react_popper_1.Popper, { placement: "top-end" }, ({ ref, style, placement, arrowProps }) => (React.createElement("div", { ref: ref, style: style, className: classnames_1.default('module-sticker-button__tooltip', 'module-sticker-button__tooltip--introduction'), role: "button", onClick: handleClearIntroduction },
                    React.createElement("div", { className: "module-sticker-button__tooltip--introduction__image" }),
                    React.createElement("div", { className: "module-sticker-button__tooltip--introduction__meta" },
                        React.createElement("div", { className: "module-sticker-button__tooltip--introduction__meta__title" }, i18n('stickers--StickerManager--Introduction--Title')),
                        React.createElement("div", { className: "module-sticker-button__tooltip--introduction__meta__subtitle" }, i18n('stickers--StickerManager--Introduction--Body'))),
                    React.createElement("div", { className: "module-sticker-button__tooltip--introduction__close" },
                        React.createElement("button", { className: "module-sticker-button__tooltip--introduction__close__button", onClick: handleClearIntroduction })),
                    React.createElement("div", { ref: arrowProps.ref, style: arrowProps.style, className: classnames_1.default('module-sticker-button__tooltip__triangle', 'module-sticker-button__tooltip__triangle--introduction', `module-sticker-button__tooltip__triangle--${placement}`) }))))) : null,
                open && popperRoot
                    ? react_dom_1.createPortal(React.createElement(react_popper_1.Popper, { placement: "top-end" }, ({ ref, style }) => (React.createElement(StickerPicker_1.StickerPicker, { ref: ref, i18n: i18n, style: style, packs: installedPacks, onClickAddPack: handleClickAddPack, onPickSticker: handlePickSticker, recentStickers: recentStickers, showPickerHint: showPickerHint }))), popperRoot)
                    : null));
        });
})();