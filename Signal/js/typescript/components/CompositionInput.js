(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.CompositionInput = {};

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
    const react_dom_1 = window.react_dom;
    const reselect_1 = window.reselect;
    const draft_js_1 = window.draft_js;
    const react_measure_1 = __importDefault(window.react_measure);
    const react_popper_1 = window.react_popper;
    const lodash_1 = window.lodash;
    const classnames_1 = __importDefault(window.classnames);
    const emoji_regex_1 = __importDefault(window.emoji_regex);
    const Emoji_1 = window.ts.components.emoji.Emoji;
    const lib_1 = window.ts.components.emoji.lib;
    const MAX_LENGTH = 64 * 1024;
    const colonsRegex = /(?:^|\s):[a-z0-9-_+]+:?/gi;
    const triggerEmojiRegex = /^(?:[-+]\d|[a-z]{2})/i;
    function getTrimmedMatchAtIndex(str, index, pattern) {
        let match;
        // Reset regex state
        pattern.exec('');
        // tslint:disable-next-line no-conditional-assignment
        while ((match = pattern.exec(str))) {
            const matchStr = match.toString();
            const start = match.index + (matchStr.length - matchStr.trimLeft().length);
            const end = match.index + matchStr.trimRight().length;
            if (index >= start && index <= end) {
                return match.toString();
            }
        }
        return null;
    }
    function getLengthOfSelectedText(state) {
        const currentSelection = state.getSelection();
        let length = 0;
        const currentContent = state.getCurrentContent();
        const startKey = currentSelection.getStartKey();
        const endKey = currentSelection.getEndKey();
        const startBlock = currentContent.getBlockForKey(startKey);
        const isStartAndEndBlockAreTheSame = startKey === endKey;
        const startBlockTextLength = startBlock.getLength();
        const startSelectedTextLength = startBlockTextLength - currentSelection.getStartOffset();
        const endSelectedTextLength = currentSelection.getEndOffset();
        const keyAfterEnd = currentContent.getKeyAfter(endKey);
        if (isStartAndEndBlockAreTheSame) {
            length +=
                currentSelection.getEndOffset() - currentSelection.getStartOffset();
        }
        else {
            let currentKey = startKey;
            while (currentKey && currentKey !== keyAfterEnd) {
                if (currentKey === startKey) {
                    length += startSelectedTextLength + 1;
                }
                else if (currentKey === endKey) {
                    length += endSelectedTextLength;
                }
                else {
                    length += currentContent.getBlockForKey(currentKey).getLength() + 1;
                }
                currentKey = currentContent.getKeyAfter(currentKey);
            }
        }
        return length;
    }
    function getWordAtIndex(str, index) {
        const start = str
            .slice(0, index + 1)
            .replace(/\s+$/, '')
            .search(/\S+$/);
        let end = str
            .slice(index)
            .split('')
            .findIndex(c => /[^a-z0-9-_]/i.test(c) || c === ':') + index;
        const endChar = str[end];
        if (/\w|:/.test(endChar)) {
            end += 1;
        }
        const word = str.slice(start, end);
        if (word === ':' && str.length > 1) {
            return getWordAtIndex(str, index + 1);
        }
        return {
            start,
            end,
            word,
        };
    }
    const compositeDecorator = new draft_js_1.CompositeDecorator([
        {
            strategy: (block, cb) => {
                const pat = emoji_regex_1.default();
                const text = block.getText();
                let match;
                let index;
                // tslint:disable-next-line no-conditional-assignment
                while ((match = pat.exec(text))) {
                    index = match.index;
                    cb(index, index + match[0].length);
                }
            },
            component: ({ children, contentState, entityKey, }) => entityKey ? (React.createElement(Emoji_1.Emoji, { shortName: contentState.getEntity(entityKey).getData().shortName, skinTone: contentState.getEntity(entityKey).getData().skinTone, inline: true, size: 20 }, children)) : (children),
        },
    ]);
    // A selector which combines multiple react refs into a single, referentially-equal functional ref.
    const combineRefs = reselect_1.createSelector((r1) => r1, (_r1, r2) => r2, (_r1, _r2, r3) => r3, (r1, r2, r3) => (el) => {
        if (lodash_1.isFunction(r1) && lodash_1.isFunction(r2)) {
            r1(el);
            r2(el);
        }
        r3.current = el;
    });
    const getInitialEditorState = (startingText) => {
        if (!startingText) {
            return draft_js_1.EditorState.createEmpty(compositeDecorator);
        }
        const end = startingText.length;
        const state = draft_js_1.EditorState.createWithContent(draft_js_1.ContentState.createFromText(startingText), compositeDecorator);
        const selection = state.getSelection();
        const selectionAtEnd = selection.merge({
            anchorOffset: end,
            focusOffset: end,
        });
        return draft_js_1.EditorState.forceSelection(state, selectionAtEnd);
    };
    // tslint:disable-next-line max-func-body-length
    exports.CompositionInput = ({ i18n, disabled, large, editorRef, inputApi, onDirtyChange, onEditorStateChange, onEditorSizeChange, onTextTooLong, onPickEmoji, onSubmit, skinTone, startingText, }) => {
        const [editorRenderState, setEditorRenderState] = React.useState(getInitialEditorState(startingText));
        const [searchText, setSearchText] = React.useState('');
        const [emojiResults, setEmojiResults] = React.useState([]);
        const [emojiResultsIndex, setEmojiResultsIndex] = React.useState(0);
        const [editorWidth, setEditorWidth] = React.useState(0);
        const [popperRoot, setPopperRoot] = React.useState(null);
        const dirtyRef = React.useRef(false);
        const focusRef = React.useRef(false);
        const editorStateRef = React.useRef(editorRenderState);
        const rootElRef = React.useRef();
        // This function sets editorState and also keeps a reference to the newly set
        // state so we can reference the state in effects and callbacks without
        // excessive cleanup
        const setAndTrackEditorState = React.useCallback((newState) => {
            setEditorRenderState(newState);
            editorStateRef.current = newState;
        }, [setEditorRenderState, editorStateRef]);
        const updateExternalStateListeners = React.useCallback((newState) => {
            const plainText = newState
                .getCurrentContent()
                .getPlainText()
                .trim();
            const cursorBlockKey = newState.getSelection().getStartKey();
            const cursorBlockIndex = editorStateRef.current
                .getCurrentContent()
                .getBlockMap()
                .keySeq()
                .findIndex(key => key === cursorBlockKey);
            const caretLocation = newState
                .getCurrentContent()
                .getBlockMap()
                .valueSeq()
                .toArray()
                .reduce((sum, block, currentIndex) => {
                    if (currentIndex < cursorBlockIndex) {
                        return sum + block.getText().length + 1; // +1 for newline
                    }
                    if (currentIndex === cursorBlockIndex) {
                        return sum + newState.getSelection().getStartOffset();
                    }
                    return sum;
                }, 0);
            if (onDirtyChange) {
                const isDirty = !!plainText;
                if (dirtyRef.current !== isDirty) {
                    dirtyRef.current = isDirty;
                    onDirtyChange(isDirty);
                }
            }
            if (onEditorStateChange) {
                onEditorStateChange(plainText, caretLocation);
            }
        }, [onDirtyChange, onEditorStateChange, editorStateRef]);
        const resetEmojiResults = React.useCallback(() => {
            setEmojiResults([]);
            setEmojiResultsIndex(0);
            setSearchText('');
        }, [setEmojiResults, setEmojiResultsIndex, setSearchText]);
        const handleEditorStateChange = React.useCallback((newState) => {
            // Does the current position have any emojiable text?
            const selection = newState.getSelection();
            const caretLocation = selection.getStartOffset();
            const content = newState
                .getCurrentContent()
                .getBlockForKey(selection.getAnchorKey())
                .getText();
            const match = getTrimmedMatchAtIndex(content, caretLocation, colonsRegex);
            // Update the state to indicate emojiable text at the current position.
            const newSearchText = match ? match.trim().substr(1) : '';
            if (newSearchText.endsWith(':')) {
                const bareText = lodash_1.trimEnd(newSearchText, ':');
                const emoji = lodash_1.head(lib_1.search(bareText));
                if (emoji && bareText === emoji.short_name) {
                    handleEditorCommand('enter-emoji', newState, emoji);
                    // Prevent inserted colon from persisting to state
                    return;
                }
                else {
                    resetEmojiResults();
                }
            }
            else if (triggerEmojiRegex.test(newSearchText) && focusRef.current) {
                setEmojiResults(lib_1.search(newSearchText, 10));
                setSearchText(newSearchText);
                setEmojiResultsIndex(0);
            }
            else {
                resetEmojiResults();
            }
            // Finally, update the editor state
            setAndTrackEditorState(newState);
            updateExternalStateListeners(newState);
        }, [
            focusRef,
            resetEmojiResults,
            setAndTrackEditorState,
            setSearchText,
            setEmojiResults,
        ]);
        const handleBeforeInput = React.useCallback(() => {
            if (!editorStateRef.current) {
                return 'not-handled';
            }
            const editorState = editorStateRef.current;
            const plainText = editorState.getCurrentContent().getPlainText();
            const selectedTextLength = getLengthOfSelectedText(editorState);
            if (plainText.length - selectedTextLength > MAX_LENGTH - 1) {
                onTextTooLong();
                return 'handled';
            }
            return 'not-handled';
        }, [onTextTooLong, editorStateRef]);
        const handlePastedText = React.useCallback((pastedText) => {
            if (!editorStateRef.current) {
                return 'not-handled';
            }
            const editorState = editorStateRef.current;
            const plainText = editorState.getCurrentContent().getPlainText();
            const selectedTextLength = getLengthOfSelectedText(editorState);
            if (plainText.length + pastedText.length - selectedTextLength >
                MAX_LENGTH) {
                onTextTooLong();
                return 'handled';
            }
            return 'not-handled';
        }, [onTextTooLong, editorStateRef]);
        const resetEditorState = React.useCallback(() => {
            const newEmptyState = draft_js_1.EditorState.createEmpty(compositeDecorator);
            setAndTrackEditorState(newEmptyState);
            resetEmojiResults();
        }, [editorStateRef, resetEmojiResults, setAndTrackEditorState]);
        const submit = React.useCallback(() => {
            const { current: state } = editorStateRef;
            const text = state.getCurrentContent().getPlainText();
            const emojidText = lib_1.replaceColons(text);
            const trimmedText = emojidText.trim();
            onSubmit(trimmedText);
        }, [editorStateRef, onSubmit]);
        const handleEditorSizeChange = React.useCallback((rect) => {
            if (rect.bounds) {
                setEditorWidth(rect.bounds.width);
                if (onEditorSizeChange) {
                    onEditorSizeChange(rect);
                }
            }
        }, [onEditorSizeChange, setEditorWidth]);
        const selectEmojiResult = React.useCallback((dir, e) => {
            if (emojiResults.length > 0) {
                if (e) {
                    e.preventDefault();
                }
                if (dir === 'next') {
                    setEmojiResultsIndex(index => {
                        const next = index + 1;
                        if (next >= emojiResults.length) {
                            return 0;
                        }
                        return next;
                    });
                }
                if (dir === 'prev') {
                    setEmojiResultsIndex(index => {
                        const next = index - 1;
                        if (next < 0) {
                            return emojiResults.length - 1;
                        }
                        return next;
                    });
                }
            }
        }, [emojiResultsIndex, emojiResults]);
        const handleEditorArrowKey = React.useCallback((e) => {
            if (e.key === 'ArrowUp') {
                selectEmojiResult('prev', e);
            }
            if (e.key === 'ArrowDown') {
                selectEmojiResult('next', e);
            }
        }, [selectEmojiResult]);
        const handleEscapeKey = React.useCallback((e) => {
            if (emojiResults.length > 0) {
                e.preventDefault();
                resetEmojiResults();
            }
        }, [resetEmojiResults, emojiResults]);
        const getWordAtCaret = React.useCallback((state = editorStateRef.current) => {
            const selection = state.getSelection();
            const index = selection.getAnchorOffset();
            return getWordAtIndex(state
                .getCurrentContent()
                .getBlockForKey(selection.getAnchorKey())
                .getText(), index);
        }, []);
        const insertEmoji = React.useCallback((e, replaceWord = false) => {
            const { current: state } = editorStateRef;
            const selection = state.getSelection();
            const oldContent = state.getCurrentContent();
            const emojiContent = lib_1.convertShortName(e.shortName, e.skinTone);
            const emojiEntityKey = oldContent
                .createEntity('emoji', 'IMMUTABLE', {
                    shortName: e.shortName,
                    skinTone: e.skinTone,
                })
                .getLastCreatedEntityKey();
            const word = getWordAtCaret();
            let newContent = draft_js_1.Modifier.replaceText(oldContent, replaceWord
                ? selection.merge({
                    anchorOffset: word.start,
                    focusOffset: word.end,
                })
                : selection, emojiContent, undefined, emojiEntityKey);
            const afterSelection = newContent.getSelectionAfter();
            if (afterSelection.getAnchorOffset() ===
                newContent.getBlockForKey(afterSelection.getAnchorKey()).getLength()) {
                newContent = draft_js_1.Modifier.insertText(newContent, afterSelection, ' ');
            }
            const newState = draft_js_1.EditorState.push(state, newContent, 'insert-emoji');
            setAndTrackEditorState(newState);
            resetEmojiResults();
        }, [editorStateRef, setAndTrackEditorState, resetEmojiResults]);
        const handleEditorCommand = React.useCallback((command, state, emojiOverride) => {
            if (command === 'enter-emoji') {
                const { short_name: shortName } = emojiOverride || emojiResults[emojiResultsIndex];
                const content = state.getCurrentContent();
                const selection = state.getSelection();
                const word = getWordAtCaret(state);
                const emojiContent = lib_1.convertShortName(shortName, skinTone);
                const emojiEntityKey = content
                    .createEntity('emoji', 'IMMUTABLE', {
                        shortName,
                        skinTone,
                    })
                    .getLastCreatedEntityKey();
                const replaceSelection = selection.merge({
                    anchorOffset: word.start,
                    focusOffset: word.end,
                });
                let newContent = draft_js_1.Modifier.replaceText(content, replaceSelection, emojiContent, undefined, emojiEntityKey);
                const afterSelection = newContent.getSelectionAfter();
                if (afterSelection.getAnchorOffset() ===
                    newContent.getBlockForKey(afterSelection.getAnchorKey()).getLength()) {
                    newContent = draft_js_1.Modifier.insertText(newContent, afterSelection, ' ');
                }
                const newState = draft_js_1.EditorState.push(state, newContent, 'insert-emoji');
                setAndTrackEditorState(newState);
                resetEmojiResults();
                onPickEmoji({ shortName });
                return 'handled';
            }
            if (command === 'submit') {
                submit();
                return 'handled';
            }
            if (command === 'next-emoji') {
                selectEmojiResult('next');
            }
            if (command === 'prev-emoji') {
                selectEmojiResult('prev');
            }
            return 'not-handled';
        }, [
            emojiResults,
            emojiResultsIndex,
            resetEmojiResults,
            selectEmojiResult,
            setAndTrackEditorState,
            skinTone,
            submit,
        ]);
        const onTab = React.useCallback((e) => {
            if (e.shiftKey || emojiResults.length === 0) {
                return;
            }
            e.preventDefault();
            handleEditorCommand('enter-emoji', editorStateRef.current);
        }, [emojiResults, editorStateRef, handleEditorCommand, resetEmojiResults]);
        const editorKeybindingFn = React.useCallback(
            // tslint:disable-next-line cyclomatic-complexity
            (e) => {
                const commandKey = lodash_1.get(window, 'platform') === 'darwin' && e.metaKey;
                const controlKey = lodash_1.get(window, 'platform') !== 'darwin' && e.ctrlKey;
                if (e.key === 'Enter' && emojiResults.length > 0) {
                    e.preventDefault();
                    return 'enter-emoji';
                }
                if (e.key === 'Enter' && !e.shiftKey) {
                    if (large && !(controlKey || commandKey)) {
                        return draft_js_1.getDefaultKeyBinding(e);
                    }
                    e.preventDefault();
                    return 'submit';
                }
                if (e.key === 'n' && e.ctrlKey) {
                    e.preventDefault();
                    return 'next-emoji';
                }
                if (e.key === 'p' && e.ctrlKey) {
                    e.preventDefault();
                    return 'prev-emoji';
                }
                // Get rid of default draft.js ctrl-m binding which interferes with Windows minimize
                if (e.key === 'm' && e.ctrlKey) {
                    return null;
                }
                if (lodash_1.get(window, 'platform') === 'linux') {
                    // Get rid of default draft.js shift-del binding which interferes with Linux cut
                    if (e.key === 'Delete' && e.shiftKey) {
                        return null;
                    }
                }
                // Get rid of Ctrl-Shift-M, which by default adds a newline
                if ((e.key === 'm' || e.key === 'M') && e.shiftKey && e.ctrlKey) {
                    e.preventDefault();
                    return null;
                }
                // Get rid of Ctrl-/, which on GNOME is bound to 'select all'
                if (e.key === '/' && !e.shiftKey && e.ctrlKey) {
                    e.preventDefault();
                    return null;
                }
                return draft_js_1.getDefaultKeyBinding(e);
            }, [emojiResults, large]);
        // Create popper root
        React.useEffect(() => {
            if (emojiResults.length > 0) {
                const root = document.createElement('div');
                setPopperRoot(root);
                document.body.appendChild(root);
                return () => {
                    document.body.removeChild(root);
                    setPopperRoot(null);
                };
            }
            return lodash_1.noop;
        }, [setPopperRoot, emojiResults]);
        const onFocus = React.useCallback(() => {
            focusRef.current = true;
        }, [focusRef]);
        const onBlur = React.useCallback(() => {
            focusRef.current = false;
        }, [focusRef]);
        // Manage focus
        // Chromium places the editor caret at the beginning of contenteditable divs on focus
        // Here, we force the last known selection on focusin (doing this with onFocus wasn't behaving properly)
        // This needs to be done in an effect because React doesn't support focus{In,Out}
        // https://github.com/facebook/react/issues/6410
        React.useLayoutEffect(() => {
            const { current: rootEl } = rootElRef;
            if (rootEl) {
                const onFocusIn = () => {
                    const { current: oldState } = editorStateRef;
                    // Force selection to be old selection
                    setAndTrackEditorState(draft_js_1.EditorState.forceSelection(oldState, oldState.getSelection()));
                };
                rootEl.addEventListener('focusin', onFocusIn);
                return () => {
                    rootEl.removeEventListener('focusin', onFocusIn);
                };
            }
            return lodash_1.noop;
        }, [editorStateRef, rootElRef, setAndTrackEditorState]);
        if (inputApi) {
            inputApi.current = {
                reset: resetEditorState,
                submit,
                insertEmoji,
                resetEmojiResults,
            };
        }
        return (React.createElement(react_popper_1.Manager, null,
            React.createElement(react_popper_1.Reference, null, (popperRef) => (React.createElement(react_measure_1.default, { bounds: true, onResize: handleEditorSizeChange }, ({ measureRef }) => (React.createElement("div", { className: "module-composition-input__input", ref: combineRefs(popperRef.ref, measureRef, rootElRef) },
                React.createElement("div", {
                    className: classnames_1.default('module-composition-input__input__scroller', large
                        ? 'module-composition-input__input__scroller--large'
                        : null)
                },
                    React.createElement(draft_js_1.Editor, { ref: editorRef, editorState: editorRenderState, onChange: handleEditorStateChange, placeholder: i18n('sendMessage'), onUpArrow: handleEditorArrowKey, onDownArrow: handleEditorArrowKey, onEscape: handleEscapeKey, onTab: onTab, handleKeyCommand: handleEditorCommand, handleBeforeInput: handleBeforeInput, handlePastedText: handlePastedText, keyBindingFn: editorKeybindingFn, spellCheck: true, stripPastedStyles: true, readOnly: disabled, onFocus: onFocus, onBlur: onBlur }))))))),
            emojiResults.length > 0 && popperRoot
                ? react_dom_1.createPortal(React.createElement(react_popper_1.Popper, { placement: "top", key: searchText }, ({ ref, style }) => (React.createElement("div", { ref: ref, className: "module-composition-input__emoji-suggestions", style: Object.assign({}, style, { width: editorWidth }), role: "listbox", "aria-expanded": true, "aria-activedescendant": `emoji-result--${emojiResults[emojiResultsIndex].short_name}` }, emojiResults.map((emoji, index) => (React.createElement("button", {
                    key: emoji.short_name, id: `emoji-result--${emoji.short_name}`, role: "option button", "aria-selected": emojiResultsIndex === index, onMouseDown: () => {
                        insertEmoji({ shortName: emoji.short_name, skinTone }, true);
                        onPickEmoji({ shortName: emoji.short_name });
                    }, className: classnames_1.default('module-composition-input__emoji-suggestions__row', emojiResultsIndex === index
                        ? 'module-composition-input__emoji-suggestions__row--selected'
                        : null)
                },
                    React.createElement(Emoji_1.Emoji, { shortName: emoji.short_name, size: 16, skinTone: skinTone }),
                    React.createElement("div", { className: "module-composition-input__emoji-suggestions__row__short-name" },
                        ":",
                        emoji.short_name,
                        ":"))))))), popperRoot)
                : null));
    };
})();