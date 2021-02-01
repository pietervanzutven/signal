(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.StickerPicker = {};

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
    /* tslint:disable:max-func-body-length */
    /* tslint:disable:cyclomatic-complexity */
    const React = __importStar(window.react);
    const classnames_1 = __importDefault(window.classnames);
    function useTabs(tabs, initialTab = tabs[0]) {
        const [tab, setTab] = React.useState(initialTab);
        const handlers = React.useMemo(() => tabs.map(t => () => {
            setTab(t);
        }), tabs);
        return [tab, handlers];
    }
    const PACKS_PAGE_SIZE = 7;
    const PACK_ICON_WIDTH = 32;
    const PACK_PAGE_WIDTH = PACKS_PAGE_SIZE * PACK_ICON_WIDTH;
    function getPacksPageOffset(page, packs) {
        if (page === 0) {
            return 0;
        }
        if (isLastPacksPage(page, packs)) {
            return (PACK_PAGE_WIDTH * (Math.floor(packs / PACKS_PAGE_SIZE) - 1) +
                ((packs % PACKS_PAGE_SIZE) - 1) * PACK_ICON_WIDTH);
        }
        return page * PACK_ICON_WIDTH * PACKS_PAGE_SIZE;
    }
    function isLastPacksPage(page, packs) {
        return page === Math.floor(packs / PACKS_PAGE_SIZE);
    }
    exports.StickerPicker = React.memo(React.forwardRef(({ i18n, packs, recentStickers, onClose, onClickAddPack, onPickSticker, showPickerHint, style, }, ref) => {
        const focusRef = React.useRef(null);
        const tabIds = React.useMemo(() => ['recents', ...packs.map(({ id }) => id)], packs);
        const [currentTab, [recentsHandler, ...packsHandlers]] = useTabs(tabIds,
            // If there are no recent stickers, default to the first sticker pack, unless there are no sticker packs.
            tabIds[recentStickers.length > 0 ? 0 : Math.min(1, tabIds.length)]);
        const selectedPack = packs.find(({ id }) => id === currentTab);
        const { stickers = recentStickers, title: packTitle = 'Recent Stickers', } = selectedPack || {};
        const [isUsingKeyboard, setIsUsingKeyboard] = React.useState(false);
        const [packsPage, setPacksPage] = React.useState(0);
        const onClickPrevPackPage = React.useCallback(() => {
            setPacksPage(i => i - 1);
        }, [setPacksPage]);
        const onClickNextPackPage = React.useCallback(() => {
            setPacksPage(i => i + 1);
        }, [setPacksPage]);
        // Handle escape key
        React.useEffect(() => {
            const handler = (event) => {
                if (event.key === 'Tab') {
                    // We do NOT prevent default here to allow Tab to be used normally
                    setIsUsingKeyboard(true);
                    return;
                }
                if (event.key === 'Escape') {
                    event.stopPropagation();
                    event.preventDefault();
                    onClose();
                    return;
                }
            };
            document.addEventListener('keydown', handler);
            return () => {
                document.removeEventListener('keydown', handler);
            };
        }, [onClose]);
        // Focus popup on after initial render, restore focus on teardown
        React.useEffect(() => {
            const lastFocused = document.activeElement;
            if (focusRef.current) {
                focusRef.current.focus();
            }
            return () => {
                if (lastFocused && lastFocused.focus) {
                    lastFocused.focus();
                }
            };
        }, []);
        const isEmpty = stickers.length === 0;
        const addPackRef = isEmpty ? focusRef : undefined;
        const downloadError = selectedPack &&
            selectedPack.status === 'error' &&
            selectedPack.stickerCount !== selectedPack.stickers.length;
        const pendingCount = selectedPack && selectedPack.status === 'pending'
            ? selectedPack.stickerCount - stickers.length
            : 0;
        const hasPacks = packs.length > 0;
        const isRecents = hasPacks && currentTab === 'recents';
        const showPendingText = pendingCount > 0;
        const showDownlaodErrorText = downloadError;
        const showEmptyText = !downloadError && isEmpty;
        const showText = showPendingText || showDownlaodErrorText || showEmptyText;
        const showLongText = showPickerHint;
        return (React.createElement("div", { className: "module-sticker-picker", ref: ref, style: style },
            React.createElement("div", { className: "module-sticker-picker__header" },
                React.createElement("div", { className: "module-sticker-picker__header__packs" },
                    React.createElement("div", {
                        className: "module-sticker-picker__header__packs__slider", style: {
                            transform: `translateX(-${getPacksPageOffset(packsPage, packs.length)}px)`,
                        }
                    },
                        hasPacks ? (React.createElement("button", {
                            onClick: recentsHandler, className: classnames_1.default({
                                'module-sticker-picker__header__button': true,
                                'module-sticker-picker__header__button--recents': true,
                                'module-sticker-picker__header__button--selected': currentTab === 'recents',
                            })
                        })) : null,
                        packs.map((pack, i) => (React.createElement("button", {
                            key: pack.id, onClick: packsHandlers[i], className: classnames_1.default('module-sticker-picker__header__button', {
                                'module-sticker-picker__header__button--selected': currentTab === pack.id,
                                'module-sticker-picker__header__button--error': pack.status === 'error',
                            })
                        }, pack.cover ? (React.createElement("img", { className: "module-sticker-picker__header__button__image", src: pack.cover.url, alt: pack.title, title: pack.title })) : (React.createElement("div", { className: "module-sticker-picker__header__button__image-placeholder" })))))),
                    !isUsingKeyboard && packsPage > 0 ? (React.createElement("button", { className: classnames_1.default('module-sticker-picker__header__button', 'module-sticker-picker__header__button--prev-page'), onClick: onClickPrevPackPage })) : null,
                    !isUsingKeyboard && !isLastPacksPage(packsPage, packs.length) ? (React.createElement("button", { className: classnames_1.default('module-sticker-picker__header__button', 'module-sticker-picker__header__button--next-page'), onClick: onClickNextPackPage })) : null),
                React.createElement("button", {
                    ref: addPackRef, className: classnames_1.default('module-sticker-picker__header__button', 'module-sticker-picker__header__button--add-pack', {
                        'module-sticker-picker__header__button--hint': showPickerHint,
                    }), onClick: onClickAddPack
                })),
            React.createElement("div", {
                className: classnames_1.default('module-sticker-picker__body', {
                    'module-sticker-picker__body--empty': isEmpty,
                })
            },
                showPickerHint ? (React.createElement("div", {
                    className: classnames_1.default('module-sticker-picker__body__text', 'module-sticker-picker__body__text--hint', {
                        'module-sticker-picker__body__text--pin': showEmptyText,
                    })
                }, i18n('stickers--StickerPicker--Hint'))) : null,
                !hasPacks ? (React.createElement("div", { className: "module-sticker-picker__body__text" }, i18n('stickers--StickerPicker--NoPacks'))) : null,
                pendingCount > 0 ? (React.createElement("div", { className: "module-sticker-picker__body__text" }, i18n('stickers--StickerPicker--DownloadPending'))) : null,
                downloadError ? (React.createElement("div", { className: classnames_1.default('module-sticker-picker__body__text', 'module-sticker-picker__body__text--error') }, stickers.length > 0
                    ? i18n('stickers--StickerPicker--DownloadError')
                    : i18n('stickers--StickerPicker--Empty'))) : null,
                hasPacks && showEmptyText ? (React.createElement("div", {
                    className: classnames_1.default('module-sticker-picker__body__text', {
                        'module-sticker-picker__body__text--error': !isRecents,
                    })
                }, isRecents
                    ? i18n('stickers--StickerPicker--NoRecents')
                    : i18n('stickers--StickerPicker--Empty'))) : null,
                !isEmpty ? (React.createElement("div", {
                    className: classnames_1.default('module-sticker-picker__body__content', {
                        'module-sticker-picker__body__content--under-text': showText,
                        'module-sticker-picker__body__content--under-long-text': showLongText,
                    })
                },
                    stickers.map(({ packId, id, url }, index) => {
                        const maybeFocusRef = index === 0 ? focusRef : undefined;
                        return (React.createElement("button", { ref: maybeFocusRef, key: `${packId}-${id}`, className: "module-sticker-picker__body__cell", onClick: () => onPickSticker(packId, id) },
                            React.createElement("img", { className: "module-sticker-picker__body__cell__image", src: url, alt: packTitle })));
                    }),
                    Array(pendingCount)
                        .fill(0)
                        .map((_, i) => (React.createElement("div", { key: i, className: "module-sticker-picker__body__cell__placeholder", role: "presentation" }))))) : null)));
    }));
})();