require(exports => {
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
    const completion_1 = require("../quill/mentions/completion");
    const emoji_1 = require("../quill/emoji");
    const lib_1 = require("./emoji/lib");
    const blot_1 = require("../quill/mentions/blot");
    const matchers_1 = require("../quill/emoji/matchers");
    const matchers_2 = require("../quill/mentions/matchers");
    const util_1 = require("../quill/util");
    quill_1.default.register('formats/emoji', emoji_1.EmojiBlot);
    quill_1.default.register('formats/mention', blot_1.MentionBlot);
    quill_1.default.register('modules/emojiCompletion', emoji_1.EmojiCompletion);
    quill_1.default.register('modules/mentionCompletion', completion_1.MentionCompletion);
    const Block = quill_1.default.import('blots/block');
    Block.tagName = 'DIV';
    quill_1.default.register(Block, true);
    const MAX_LENGTH = 64 * 1024;
    exports.CompositionInput = props => {
        const { i18n, disabled, large, inputApi, onPickEmoji, onSubmit, skinTone, draftText, draftBodyRanges, getQuotedMessage, clearQuotedMessage, members, } = props;
        const [emojiCompletionElement, setEmojiCompletionElement] = React.useState();
        const [lastSelectionRange, setLastSelectionRange,] = React.useState(null);
        const [mentionCompletionElement, setMentionCompletionElement,] = React.useState();
        const emojiCompletionRef = React.useRef();
        const mentionCompletionRef = React.useRef();
        const quillRef = React.useRef();
        const scrollerRef = React.useRef(null);
        const propsRef = React.useRef(props);
        const memberRepositoryRef = React.useRef(new util_1.MemberRepository());
        const insertMentionOps = (incomingOps, bodyRanges) => {
            const ops = [...incomingOps];
            // Working backwards through bodyRanges (to avoid offsetting later mentions),
            // Shift off the op with the text to the left of the last mention,
            // Insert a mention based on the current bodyRange,
            // Unshift the mention and surrounding text to leave the ops ready for the next range
            bodyRanges
                .sort((a, b) => b.start - a.start)
                .forEach(({ start, length, mentionUuid, replacementText }) => {
                    const op = ops.shift();
                    if (op) {
                        const { insert } = op;
                        if (typeof insert === 'string') {
                            const left = insert.slice(0, start);
                            const right = insert.slice(start + length);
                            const mention = {
                                uuid: mentionUuid,
                                title: replacementText,
                            };
                            ops.unshift({ insert: right });
                            ops.unshift({ insert: { mention } });
                            ops.unshift({ insert: left });
                        }
                        else {
                            ops.unshift(op);
                        }
                    }
                });
            return ops;
        };
        const insertEmojiOps = (incomingOps) => {
            return incomingOps.reduce((ops, op) => {
                if (typeof op.insert === 'string') {
                    const text = op.insert;
                    const re = emoji_regex_1.default();
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
                }
                else {
                    ops.push(op);
                }
                return ops;
            }, []);
        };
        const generateDelta = (text, bodyRanges) => {
            const initialOps = [{ insert: text }];
            const opsWithMentions = insertMentionOps(initialOps, bodyRanges);
            const opsWithEmojis = insertEmojiOps(opsWithMentions);
            return new quill_delta_1.default(opsWithEmojis);
        };
        const getTextAndMentions = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return ['', []];
            }
            const contents = quill.getContents();
            if (contents === undefined) {
                return ['', []];
            }
            const { ops } = contents;
            if (ops === undefined) {
                return ['', []];
            }
            return util_1.getTextAndMentionsFromOps(ops);
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
            const [text, mentions] = getTextAndMentions();
            window.log.info(`Submitting a message with ${mentions.length} mentions`);
            onSubmit(text, mentions);
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
            const mentionCompletion = mentionCompletionRef.current;
            if (quill === undefined) {
                return false;
            }
            if (emojiCompletion === undefined || mentionCompletion === undefined) {
                return false;
            }
            if (emojiCompletion.results.length) {
                emojiCompletion.completeEmoji();
                return false;
            }
            if (mentionCompletion.results.length) {
                mentionCompletion.completeMention();
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
            const mentionCompletion = mentionCompletionRef.current;
            if (quill === undefined) {
                return false;
            }
            if (emojiCompletion === undefined || mentionCompletion === undefined) {
                return false;
            }
            if (emojiCompletion.results.length) {
                emojiCompletion.completeEmoji();
                return false;
            }
            if (mentionCompletion.results.length) {
                mentionCompletion.completeMention();
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
            const mentionCompletion = mentionCompletionRef.current;
            if (emojiCompletion) {
                if (emojiCompletion.results.length) {
                    emojiCompletion.reset();
                    return false;
                }
            }
            if (mentionCompletion) {
                if (mentionCompletion.results.length) {
                    mentionCompletion.reset();
                    return false;
                }
            }
            if (getQuotedMessage()) {
                clearQuotedMessage();
                return false;
            }
            return true;
        };
        const onCtrlA = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            quill.setSelection(0, 0);
        };
        const onCtrlE = () => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            quill.setSelection(quill.getLength(), 0);
        };
        const onChange = () => {
            const quill = quillRef.current;
            const [text, mentions] = getTextAndMentions();
            if (quill !== undefined) {
                const historyModule = quill.getModule('history');
                if (text.length > MAX_LENGTH) {
                    historyModule.undo();
                    propsRef.current.onTextTooLong();
                    return;
                }
                if (propsRef.current.onEditorStateChange) {
                    const selection = quill.getSelection();
                    propsRef.current.onEditorStateChange(text, mentions, selection ? selection.index : undefined);
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
            const mentionCompletion = mentionCompletionRef.current;
            if (emojiCompletion !== undefined) {
                emojiCompletion.destroy();
            }
            if (mentionCompletion !== undefined) {
                mentionCompletion.destroy();
            }
        }, []);
        const removeStaleMentions = (currentMembers) => {
            const quill = quillRef.current;
            if (quill === undefined) {
                return;
            }
            const { ops } = quill.getContents();
            if (ops === undefined) {
                return;
            }
            const currentMemberUuids = currentMembers
                .map(m => m.uuid)
                .filter((uuid) => uuid !== undefined);
            const newDelta = util_1.getDeltaToRemoveStaleMentions(ops, currentMemberUuids);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            quill.updateContents(newDelta);
        };
        const memberIds = members ? members.map(m => m.id) : [];
        React.useEffect(() => {
            memberRepositoryRef.current.updateMembers(members || []);
            removeStaleMentions(members || []);
            // We are still depending on members, but ESLint can't tell
            // Comparing the actual members list does not work for a couple reasons:
            //    * Arrays with the same objects are not "equal" to React
            //    * We only care about added/removed members, ignoring other attributes
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [JSON.stringify(memberIds)]);
        const reactQuill = React.useMemo(() => {
            const delta = generateDelta(draftText || '', draftBodyRanges || []);
            return (React.createElement(react_quill_1.default, {
                className: "module-composition-input__quill", onChange: onChange, defaultValue: delta, modules: {
                    toolbar: false,
                    clipboard: {
                        matchers: [
                            ['IMG', matchers_1.matchEmojiImage],
                            ['SPAN', matchers_1.matchEmojiBlot],
                            ['SPAN', matchers_1.matchReactEmoji],
                            ['SPAN', matchers_2.matchMention(memberRepositoryRef)],
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
                            onCtrlA: { key: 65, ctrlKey: true, handler: onCtrlA },
                            onCtrlE: { key: 69, ctrlKey: true, handler: onCtrlE },
                        },
                    },
                    emojiCompletion: {
                        setEmojiPickerElement: setEmojiCompletionElement,
                        onPickEmoji,
                        skinTone,
                    },
                    mentionCompletion: {
                        me: members ? members.find(foo => foo.isMe) : undefined,
                        memberRepositoryRef,
                        setMentionPickerElement: setMentionCompletionElement,
                        i18n,
                    },
                }, formats: ['emoji', 'mention'], placeholder: i18n('sendMessage'), readOnly: disabled, ref: element => {
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
                            setTimeout(() => {
                                quill.setSelection(quill.getLength(), 0);
                                quill.root.classList.add('ql-editor--loaded');
                            }, 0);
                        });
                        quill.on('selection-change', (newRange, oldRange) => {
                            // If we lose focus, store the last edit point for emoji insertion
                            if (newRange === null) {
                                setLastSelectionRange(oldRange);
                            }
                        });
                        quillRef.current = quill;
                        emojiCompletionRef.current = quill.getModule('emojiCompletion');
                        mentionCompletionRef.current = quill.getModule('mentionCompletion');
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
                    emojiCompletionElement,
                    mentionCompletionElement))))));
    };
});