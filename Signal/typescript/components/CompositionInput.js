(function () {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
    const React = __importStar(require("react"));
    const quill_delta_1 = __importDefault(require("quill-delta"));
    const react_quill_1 = __importDefault(require("react-quill"));
    const classnames_1 = __importDefault(require("classnames"));
    const emoji_regex_1 = __importDefault(require("emoji-regex"));
    const react_popper_1 = require("react-popper");
    const quill_1 = __importDefault(require("quill"));
    const emoji_1 = require("../quill/emoji");
    const lib_1 = require("./emoji/lib");
    const matchImage_1 = require("../quill/matchImage");
    quill_1.default.register('formats/emoji', emoji_1.EmojiBlot);
    quill_1.default.register('modules/emojiCompletion', emoji_1.EmojiCompletion);
    const Block = quill_1.default.import('blots/block');
    Block.tagName = 'DIV';
    quill_1.default.register(Block, true);
    const MAX_LENGTH = 64 * 1024;
    exports.CompositionInput = props => {
        const { i18n, disabled, large, inputApi, onPickEmoji, onSubmit, skinTone, startingText, } = props;
        const [emojiCompletionElement, setEmojiCompletionElement] = React.useState();
        const [lastSelectionRange, setLastSelectionRange,] = React.useState(null);
        const emojiCompletionRef = React.useRef();
        const quillRef = React.useRef();
        const scrollerRef = React.useRef(null);
        const propsRef = React.useRef(props);
        const generateDelta = (text) => {
            const re = emoji_regex_1.default();
            const ops = [];
            let index = 0;
            let match;
            // eslint-disable-next-line no-cond-assign
            while ((match = re.exec(text))) {
                const [emoji] = match;
                ops.push({ insert: text.slice(index, match.index) });
                ops.push({ insert: { emoji } });
                index = match.index + emoji.length;
            }
            ops.push({ insert: text.slice(index, text.length) });
            return new quill_delta_1.default(ops);
        };
        const getText = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return '';
            }
            const contents = quill.getContents();
            if (contents === undefined) {
                return '';
            }
            const { ops } = contents;
            if (ops === undefined) {
                return '';
            }
            const text = ops.reduce((acc, { insert }) => {
                if (typeof insert === 'string') {
                    return acc + insert;
                }
                if (insert.emoji) {
                    return acc + insert.emoji;
                }
                return acc;
            }, '');
            return text.trim();
        };
        const focus = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            quill.focus();
        };
        const insertEmoji = (e) => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            const range = quill.getSelection();
            const insertionRange = range || lastSelectionRange;
            if (insertionRange === null) {
                return;
            }
            const emoji = lib_1.convertShortName(e.shortName, e.skinTone);
            const delta = new quill_delta_1.default()
                .retain(insertionRange.index)
                .delete(insertionRange.length)
                .insert({ emoji });
            quill.updateContents(delta, 'user');
            quill.setSelection(insertionRange.index + 1, 0, 'user');
        };
        const reset = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            quill.setText('');
            const historyModule = quill.getModule('history');
            if (historyModule === undefined) {
                return;
            }
            historyModule.clear();
        };
        const resetEmojiResults = () => {
            const emojiCompletion = emojiCompletionRef.current;
            if (emojiCompletion === undefined) {
                return;
            }
            emojiCompletion.reset();
        };
        const submit = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            const text = getText();
            onSubmit(text.trim());
        };
        if (inputApi) {
            // eslint-disable-next-line no-param-reassign
            inputApi.current = {
                focus,
                insertEmoji,
                reset,
                resetEmojiResults,
                submit,
            };
        }
        React.useEffect(() => {
            propsRef.current = props;
        }, [props]);
        const onShortKeyEnter = () => {
            submit();
            return false;
        };
        const onEnter = () => {
            const quill = quillRef.current;
            const emojiCompletion = emojiCompletionRef.current;
            if (quill === undefined) {
                return false;
            }
            if (emojiCompletion === undefined) {
                return false;
            }
            if (emojiCompletion.results.length) {
                emojiCompletion.completeEmoji();
                return false;
            }
            if (propsRef.current.large) {
                return true;
            }
            submit();
            return false;
        };
        const onTab = () => {
            const quill = quillRef.current;
            const emojiCompletion = emojiCompletionRef.current;
            if (quill === undefined) {
                return false;
            }
            if (emojiCompletion === undefined) {
                return false;
            }
            if (emojiCompletion.results.length) {
                emojiCompletion.completeEmoji();
                return false;
            }
            return true;
        };
        const onEscape = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return false;
            }
            const emojiCompletion = emojiCompletionRef.current;
            if (emojiCompletion) {
                if (emojiCompletion.results.length) {
                    emojiCompletion.reset();
                    return false;
                }
            }
            if (propsRef.current.getQuotedMessage()) {
                propsRef.current.clearQuotedMessage();
                return false;
            }
            return true;
        };
        const onChange = () => {
            const text = getText();
            const quill = quillRef.current;
            if (quill !== undefined) {
                const historyModule = quill.getModule('history');
                if (text.length > MAX_LENGTH) {
                    historyModule.undo();
                    propsRef.current.onTextTooLong();
                    return;
                }
                if (propsRef.current.onEditorStateChange) {
                    const selection = quill.getSelection();
                    propsRef.current.onEditorStateChange(text, selection ? selection.index : undefined);
                }
            }
            if (propsRef.current.onDirtyChange) {
                propsRef.current.onDirtyChange(text.length > 0);
            }
        };
        React.useEffect(() => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            quill.enable(!disabled);
            quill.focus();
        }, [disabled]);
        React.useEffect(() => {
            const emojiCompletion = emojiCompletionRef.current;
            if (emojiCompletion === undefined || skinTone === undefined) {
                return;
            }
            emojiCompletion.options.skinTone = skinTone;
        }, [skinTone]);
        React.useEffect(() => () => {
            const emojiCompletion = emojiCompletionRef.current;
            if (emojiCompletion === undefined) {
                return;
            }
            emojiCompletion.destroy();
        }, []);
        const reactQuill = React.useMemo(() => {
            const delta = generateDelta(startingText || '');
            return (React.createElement(react_quill_1.default, {
                className: "module-composition-input__quill", onChange: onChange, defaultValue: delta, modules: {
                    toolbar: false,
                    clipboard: {
                        matchers: [
                            ['IMG', matchImage_1.matchEmojiImage],
                            ['SPAN', matchImage_1.matchEmojiBlot],
                        ],
                    },
                    keyboard: {
                        bindings: {
                            onEnter: { key: 13, handler: onEnter },
                            onShortKeyEnter: {
                                key: 13,
                                shortKey: true,
                                handler: onShortKeyEnter,
                            },
                            onEscape: { key: 27, handler: onEscape },
                        },
                    },
                    emojiCompletion: {
                        setEmojiPickerElement: setEmojiCompletionElement,
                        onPickEmoji,
                        skinTone,
                    },
                }, formats: ['emoji'], placeholder: i18n('sendMessage'), readOnly: disabled, ref: element => {
                    if (element) {
                        const quill = element.getEditor();
                        const keyboard = quill.getModule('keyboard');
                        // force the tab handler to be prepended, otherwise it won't be
                        // executed: https://github.com/quilljs/quill/issues/1967
                        keyboard.bindings[9].unshift({ key: 9, handler: onTab }); // 9 = Tab
                        // also, remove the default \t insertion binding
                        keyboard.bindings[9].pop();
                        // When loading a multi-line message out of a draft, the cursor
                        // position needs to be pushed to the end of the input manually.
                        quill.once('editor-change', () => {
                            const scroller = scrollerRef.current;
                            if (scroller !== null) {
                                quill.scrollingContainer = scroller;
                            }
                            quill.setSelection(quill.getLength(), 0);
                        });
                        quill.on('selection-change', (newRange, oldRange) => {
                            // If we lose focus, store the last edit point for emoji insertion
                            if (newRange === null) {
                                setLastSelectionRange(oldRange);
                            }
                        });
                        quillRef.current = quill;
                        emojiCompletionRef.current = quill.getModule('emojiCompletion');
                    }
                }
            }));
        },
            // quill shouldn't re-render, all changes should take place exclusively
            // through mutating the quill state directly instead of through props
            // eslint-disable-next-line react-hooks/exhaustive-deps
            []);
        return (React.createElement(react_popper_1.Manager, null,
            React.createElement(react_popper_1.Reference, null, ({ ref }) => (React.createElement("div", { className: "module-composition-input__input", ref: ref },
                React.createElement("div", {
                    ref: scrollerRef, className: classnames_1.default('module-composition-input__input__scroller', large
                        ? 'module-composition-input__input__scroller--large'
                        : null)
                },
                    reactQuill,
                    emojiCompletionElement))))));
    };
})();