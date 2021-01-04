(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.emoji = window.ts.components.emoji || {};
    const exports = window.ts.components.emoji.EmojiPicker = {};

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
    const react_virtualized_1 = window.react_virtualized;
    const lodash_1 = window.lodash;
    const Emoji_1 = window.ts.components.emoji.Emoji;
    const lib_1 = window.ts.components.emoji.lib;
    function focusRef(el) {
        if (el) {
            el.focus();
        }
    }
    const COL_COUNT = 8;
    const categories = [
        'recents',
        'emoji',
        'animal',
        'food',
        'activity',
        'travel',
        'object',
        'symbol',
        'flag',
    ];
    exports.EmojiPicker = React.memo(React.forwardRef(
        // tslint:disable-next-line max-func-body-length
        ({ i18n, onForceSend, onPickEmoji, skinTone = 0, onSetSkinTone, recentEmojis, style, onClose, }, ref) => {
            // Per design: memoize the initial recent emojis so the grid only updates after re-opening the picker.
            const firstRecent = React.useMemo(() => {
                return recentEmojis;
            }, []);
            const [selectedCategory, setSelectedCategory] = React.useState(categories[0]);
            const [searchMode, setSearchMode] = React.useState(false);
            const [searchText, setSearchText] = React.useState('');
            const [scrollToRow, setScrollToRow] = React.useState(0);
            const [selectedTone, setSelectedTone] = React.useState(skinTone);
            const handleToggleSearch = React.useCallback(() => {
                setSearchText('');
                setSelectedCategory(categories[0]);
                setSearchMode(m => !m);
            }, [setSearchText, setSearchMode]);
            const debounceSearchChange = React.useMemo(() => lodash_1.debounce(query => {
                setSearchText(query);
                setScrollToRow(0);
            }, 200), [setSearchText, setScrollToRow]);
            const handleSearchChange = React.useCallback((e) => {
                debounceSearchChange(e.currentTarget.value);
            }, [debounceSearchChange]);
            const handlePickTone = React.useCallback((e) => {
                const { tone = '0' } = e.currentTarget.dataset;
                const parsedTone = parseInt(tone, 10);
                setSelectedTone(parsedTone);
                onSetSkinTone(parsedTone);
            }, []);
            const handlePickEmoji = React.useCallback((e) => {
                if ('key' in e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        onForceSend();
                    }
                }
                else {
                    const { shortName } = e.currentTarget.dataset;
                    if (shortName) {
                        onPickEmoji({ skinTone: selectedTone, shortName });
                    }
                }
            }, [onClose, onForceSend, onPickEmoji, selectedTone]);
            // Handle escape key
            React.useEffect(() => {
                const handler = (e) => {
                    if (searchMode && e.key === 'Escape') {
                        setSearchText('');
                        setSearchMode(false);
                        setScrollToRow(0);
                    }
                    else if (!searchMode &&
                        ![
                            'ArrowUp',
                            'ArrowDown',
                            'ArrowLeft',
                            'ArrowRight',
                            'Shift',
                            'Tab',
                            ' ',
                        ].includes(e.key)) {
                        onClose();
                    }
                };
                document.addEventListener('keyup', handler);
                return () => {
                    document.removeEventListener('keyup', handler);
                };
            }, [onClose, searchMode]);
            const emojiGrid = React.useMemo(() => {
                if (searchText) {
                    return lodash_1.chunk(lib_1.search(searchText).map(e => e.short_name), COL_COUNT);
                }
                const [, ...cats] = categories;
                const chunks = lodash_1.flatMap(cats, cat => lodash_1.chunk(lib_1.dataByCategory[cat].map(e => e.short_name), COL_COUNT));
                return [...lodash_1.chunk(firstRecent, COL_COUNT), ...chunks];
            }, [lib_1.dataByCategory, categories, firstRecent, searchText]);
            const catRowEnds = React.useMemo(() => {
                const rowEnds = [
                    Math.ceil(firstRecent.length / COL_COUNT) - 1,
                ];
                const [, ...cats] = categories;
                cats.forEach(cat => {
                    rowEnds.push(Math.ceil(lib_1.dataByCategory[cat].length / COL_COUNT) +
                        lodash_1.last(rowEnds));
                });
                return rowEnds;
            }, [categories, lib_1.dataByCategory]);
            const catToRowOffsets = React.useMemo(() => {
                const offsets = lodash_1.initial(catRowEnds).map(i => i + 1);
                return lodash_1.zipObject(categories, [0, ...offsets]);
            }, [categories, catRowEnds]);
            const catOffsetEntries = React.useMemo(() => Object.entries(catToRowOffsets), [catToRowOffsets]);
            const handleSelectCategory = React.useCallback(({ currentTarget }) => {
                const { category } = currentTarget.dataset;
                if (category) {
                    setSelectedCategory(category);
                    setScrollToRow(catToRowOffsets[category]);
                }
            }, [catToRowOffsets, setSelectedCategory, setScrollToRow]);
            const cellRenderer = React.useCallback(({ key, style: cellStyle, rowIndex, columnIndex }) => {
                const shortName = emojiGrid[rowIndex][columnIndex];
                return shortName ? (React.createElement("div", { key: key, className: "module-emoji-picker__body__emoji-cell", style: cellStyle },
                    React.createElement("button", { className: "module-emoji-picker__button", onClick: handlePickEmoji, onKeyDown: handlePickEmoji, "data-short-name": shortName, title: shortName },
                        React.createElement(Emoji_1.Emoji, { shortName: shortName, skinTone: selectedTone })))) : null;
            }, [emojiGrid, selectedTone]);
            const getRowHeight = React.useCallback(({ index }) => {
                if (searchText) {
                    return 34;
                }
                if (catRowEnds.includes(index) && index !== lodash_1.last(catRowEnds)) {
                    return 44;
                }
                return 34;
            }, [catRowEnds, searchText]);
            const onSectionRendered = React.useMemo(() => lodash_1.debounce(({ rowStartIndex }) => {
                const [cat] = lodash_1.findLast(catOffsetEntries, ([, row]) => rowStartIndex >= row) ||
                    categories;
                setSelectedCategory(cat);
            }, 10), [catOffsetEntries, categories]);
            return (React.createElement("div", { className: "module-emoji-picker", ref: ref, style: style },
                React.createElement("header", { className: "module-emoji-picker__header" },
                    React.createElement("button", {
                        onClick: handleToggleSearch, title: i18n('EmojiPicker--search-placeholder'), className: classnames_1.default('module-emoji-picker__button', 'module-emoji-picker__button--icon', searchMode
                            ? 'module-emoji-picker__button--icon--close'
                            : 'module-emoji-picker__button--icon--search')
                    }),
                    searchMode ? (React.createElement("div", { className: "module-emoji-picker__header__search-field" },
                        React.createElement("input", { ref: focusRef, className: "module-emoji-picker__header__search-field__input", placeholder: i18n('EmojiPicker--search-placeholder'), onChange: handleSearchChange }))) : (categories.map(cat => cat === 'recents' && firstRecent.length === 0 ? null : (React.createElement("button", {
                            key: cat, "data-category": cat, title: cat, onClick: handleSelectCategory, className: classnames_1.default('module-emoji-picker__button', 'module-emoji-picker__button--icon', `module-emoji-picker__button--icon--${cat}`, selectedCategory === cat
                                ? 'module-emoji-picker__button--selected'
                                : null)
                        }))))),
                emojiGrid.length > 0 ? (React.createElement("div", null,
                    React.createElement(react_virtualized_1.AutoSizer, null, ({ width, height }) => (React.createElement(react_virtualized_1.Grid, { key: searchText, className: "module-emoji-picker__body", width: width, height: height, columnCount: COL_COUNT, columnWidth: 38, rowHeight: getRowHeight, rowCount: emojiGrid.length, cellRenderer: cellRenderer, scrollToRow: scrollToRow, scrollToAlignment: "start", onSectionRendered: onSectionRendered }))))) : (React.createElement("div", { className: classnames_1.default('module-emoji-picker__body', 'module-emoji-picker__body--empty') },
                        i18n('EmojiPicker--empty'),
                        React.createElement(Emoji_1.Emoji, { shortName: "slightly_frowning_face", size: 16, inline: true, style: { marginLeft: '4px' } }))),
                React.createElement("footer", { className: "module-emoji-picker__footer" }, [0, 1, 2, 3, 4, 5].map(tone => (React.createElement("button", {
                    key: tone, "data-tone": tone, onClick: handlePickTone, title: i18n('EmojiPicker--skin-tone', [`${tone}`]), className: classnames_1.default('module-emoji-picker__button', 'module-emoji-picker__button--footer', selectedTone === tone
                        ? 'module-emoji-picker__button--selected'
                        : null)
                },
                    React.createElement(Emoji_1.Emoji, { shortName: "hand", skinTone: tone, size: 20 })))))));
        }));
})();