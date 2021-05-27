require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_delta_1 = __importDefault(require("quill-delta"));
    const react_1 = __importDefault(require("react"));
    const lodash_1 = __importDefault(require("lodash"));
    const react_popper_1 = require("react-popper");
    const classnames_1 = __importDefault(require("classnames"));
    const react_dom_1 = require("react-dom");
    const lib_1 = require("../../components/emoji/lib");
    const Emoji_1 = require("../../components/emoji/Emoji");
    const util_1 = require("../util");
    class EmojiCompletion {
        constructor(quill, options) {
            this.results = [];
            this.index = 0;
            this.options = options;
            this.root = document.body.appendChild(document.createElement('div'));
            this.quill = quill;
            const clearResults = () => {
                if (this.results.length) {
                    this.reset();
                }
                return true;
            };
            const changeIndex = (by) => () => {
                if (this.results.length) {
                    this.changeIndex(by);
                    return false;
                }
                return true;
            };
            this.quill.keyboard.addBinding({ key: 37 }, clearResults); // 37 = Left
            this.quill.keyboard.addBinding({ key: 38 }, changeIndex(-1)); // 38 = Up
            this.quill.keyboard.addBinding({ key: 39 }, clearResults); // 39 = Right
            this.quill.keyboard.addBinding({ key: 40 }, changeIndex(1)); // 40 = Down
            this.quill.keyboard.addBinding({
                // 186 + Shift = Colon
                key: 186,
                shiftKey: true,
            }, () => this.onTextChange(true));
            this.quill.keyboard.addBinding({
                // 58 = Also Colon
                key: 58,
            }, () => this.onTextChange(true));
            this.quill.on('text-change', lodash_1.default.debounce(() => this.onTextChange(), 100));
            this.quill.on('selection-change', this.onSelectionChange.bind(this));
        }
        destroy() {
            this.root.remove();
        }
        changeIndex(by) {
            this.index = (this.index + by + this.results.length) % this.results.length;
            this.render();
        }
        getCurrentLeafTextPartitions() {
            const range = this.quill.getSelection();
            const [blot, index] = this.quill.getLeaf(range ? range.index : -1);
            return util_1.getBlotTextPartitions(blot, index);
        }
        onSelectionChange() {
            // Selection should never change while we're editing an emoji
            this.reset();
        }
        onTextChange(justPressedColon = false) {
            const PASS_THROUGH = true;
            const INTERCEPT = false;
            const range = this.quill.getSelection();
            if (!range)
                return PASS_THROUGH;
            const [blot, index] = this.quill.getLeaf(range.index);
            const [leftTokenTextMatch, rightTokenTextMatch] = util_1.matchBlotTextPartitions(blot, index, /^(?=^|\s):([-+0-9a-z_]*)(:?)$/, /^([-+0-9a-z_]*):/);
            if (leftTokenTextMatch) {
                const [, leftTokenText, isSelfClosing] = leftTokenTextMatch;
                if (isSelfClosing || justPressedColon) {
                    if (lib_1.isShortName(leftTokenText)) {
                        const emojiData = lib_1.convertShortNameToData(leftTokenText, this.options.skinTone);
                        const numberOfColons = isSelfClosing ? 2 : 1;
                        if (emojiData) {
                            this.insertEmoji(emojiData, range.index - leftTokenText.length - numberOfColons, leftTokenText.length + numberOfColons);
                            return INTERCEPT;
                        }
                    }
                    else {
                        this.reset();
                        return PASS_THROUGH;
                    }
                }
                if (rightTokenTextMatch) {
                    const [, rightTokenText] = rightTokenTextMatch;
                    const tokenText = leftTokenText + rightTokenText;
                    if (lib_1.isShortName(tokenText)) {
                        const emojiData = lib_1.convertShortNameToData(tokenText, this.options.skinTone);
                        if (emojiData) {
                            this.insertEmoji(emojiData, range.index - leftTokenText.length - 1, tokenText.length + 2);
                            return INTERCEPT;
                        }
                    }
                }
                if (leftTokenText.length < 2) {
                    this.reset();
                    return PASS_THROUGH;
                }
                const showEmojiResults = lib_1.search(leftTokenText, 10);
                if (showEmojiResults.length > 0) {
                    this.results = showEmojiResults;
                    this.render();
                }
                else if (this.results.length !== 0) {
                    this.reset();
                }
            }
            else if (this.results.length !== 0) {
                this.reset();
            }
            return PASS_THROUGH;
        }
        completeEmoji() {
            const range = this.quill.getSelection();
            if (range === null)
                return;
            const emoji = this.results[this.index];
            const [leafText] = this.getCurrentLeafTextPartitions();
            const tokenTextMatch = /:([-+0-9a-z_]*)(:?)$/.exec(leafText);
            if (tokenTextMatch === null)
                return;
            const [, tokenText] = tokenTextMatch;
            this.insertEmoji(emoji, range.index - tokenText.length - 1, tokenText.length + 1, true);
        }
        insertEmoji(emojiData, index, range, withTrailingSpace = false) {
            const emoji = lib_1.convertShortName(emojiData.short_name, this.options.skinTone);
            const delta = new quill_delta_1.default()
                .retain(index)
                .delete(range)
                .insert({ emoji });
            if (withTrailingSpace) {
                this.quill.updateContents(delta.insert(' '), 'user');
                this.quill.setSelection(index + 2, 0, 'user');
            }
            else {
                this.quill.updateContents(delta, 'user');
                this.quill.setSelection(index + 1, 0, 'user');
            }
            this.options.onPickEmoji({
                shortName: emojiData.short_name,
                skinTone: this.options.skinTone,
            });
            this.reset();
        }
        reset() {
            if (this.results.length) {
                this.results = [];
                this.index = 0;
                this.render();
            }
        }
        onUnmount() {
            document.body.removeChild(this.root);
        }
        render() {
            const { results: emojiResults, index: emojiResultsIndex } = this;
            if (emojiResults.length === 0) {
                this.options.setEmojiPickerElement(null);
                return;
            }
            const element = react_dom_1.createPortal(react_1.default.createElement(react_popper_1.Popper, {
                placement: "top", modifiers: {
                    width: {
                        enabled: true,
                        fn: oldData => {
                            const data = oldData;
                            const { width, left } = data.offsets.reference;
                            data.styles.width = `${width}px`;
                            data.offsets.popper.width = width;
                            data.offsets.popper.left = left;
                            return data;
                        },
                        order: 840,
                    },
                }
            }, ({ ref, style }) => (react_1.default.createElement("div", {
                ref: ref, className: "module-composition-input__suggestions", style: style, role: "listbox", "aria-expanded": true, "aria-activedescendant": `emoji-result--${emojiResults.length
                    ? emojiResults[emojiResultsIndex].short_name
                    : ''}`, tabIndex: 0
            }, emojiResults.map((emoji, index) => (react_1.default.createElement("button", {
                type: "button", key: emoji.short_name, id: `emoji-result--${emoji.short_name}`, role: "option button", "aria-selected": emojiResultsIndex === index, onClick: () => {
                    this.index = index;
                    this.completeEmoji();
                }, className: classnames_1.default('module-composition-input__suggestions__row', emojiResultsIndex === index
                    ? 'module-composition-input__suggestions__row--selected'
                    : null)
            },
                react_1.default.createElement(Emoji_1.Emoji, { shortName: emoji.short_name, size: 16, skinTone: this.options.skinTone }),
                react_1.default.createElement("div", { className: "module-composition-input__suggestions__row__short-name" },
                    ":",
                    emoji.short_name,
                    ":"))))))), this.root);
            this.options.setEmojiPickerElement(element);
        }
    }
    exports.EmojiCompletion = EmojiCompletion;
});