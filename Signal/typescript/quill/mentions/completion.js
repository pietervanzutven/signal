require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = __importDefault(require("lodash"));
    const quill_delta_1 = __importDefault(require("quill-delta"));
    const react_1 = __importDefault(require("react"));
    const react_popper_1 = require("react-popper");
    const classnames_1 = __importDefault(require("classnames"));
    const react_dom_1 = require("react-dom");
    const Avatar_1 = require("../../components/Avatar");
    const util_1 = require("../util");
    const MENTION_REGEX = /(?:^|\W)@([-+\w]*)$/;
    class MentionCompletion {
        constructor(quill, options) {
            this.results = [];
            this.index = 0;
            this.options = options;
            this.root = document.body.appendChild(document.createElement('div'));
            this.quill = quill;
            this.suggestionListRef = react_1.default.createRef();
            const clearResults = () => {
                if (this.results.length) {
                    this.clearResults();
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
            this.quill.keyboard.addBinding({ key: 37 }, clearResults); // Left Arrow
            this.quill.keyboard.addBinding({ key: 38 }, changeIndex(-1)); // Up Arrow
            this.quill.keyboard.addBinding({ key: 39 }, clearResults); // Right Arrow
            this.quill.keyboard.addBinding({ key: 40 }, changeIndex(1)); // Down Arrow
            this.quill.on('text-change', lodash_1.default.debounce(this.onTextChange.bind(this), 0));
            this.quill.on('selection-change', this.onSelectionChange.bind(this));
        }
        destroy() {
            this.root.remove();
        }
        changeIndex(by) {
            this.index = (this.index + by + this.results.length) % this.results.length;
            this.render();
            const suggestionList = this.suggestionListRef.current;
            if (suggestionList) {
                const selectedElement = suggestionList.querySelector('[aria-selected="true"]');
                if (selectedElement) {
                    selectedElement.scrollIntoViewIfNeeded(false);
                }
            }
        }
        onSelectionChange() {
            // Selection should never change while we're editing a mention
            this.clearResults();
        }
        possiblyShowMemberResults() {
            const range = this.quill.getSelection();
            if (range) {
                const [blot, index] = this.quill.getLeaf(range.index);
                const [leftTokenTextMatch] = util_1.matchBlotTextPartitions(blot, index, MENTION_REGEX);
                if (leftTokenTextMatch) {
                    const [, leftTokenText] = leftTokenTextMatch;
                    let results = [];
                    const memberRepository = this.options.memberRepositoryRef.current;
                    if (memberRepository) {
                        if (leftTokenText === '') {
                            results = memberRepository.getMembers(this.options.me);
                        }
                        else {
                            const fullMentionText = leftTokenText;
                            results = memberRepository.search(fullMentionText, this.options.me);
                        }
                    }
                    return results;
                }
            }
            return [];
        }
        onTextChange() {
            const showMemberResults = this.possiblyShowMemberResults();
            if (showMemberResults.length > 0) {
                this.results = showMemberResults;
                this.index = 0;
                this.render();
            }
            else if (this.results.length !== 0) {
                this.clearResults();
            }
        }
        completeMention(resultIndexArg) {
            const resultIndex = resultIndexArg || this.index;
            const range = this.quill.getSelection();
            if (range === null)
                return;
            const member = this.results[resultIndex];
            const [blot, index] = this.quill.getLeaf(range.index);
            const [leftTokenTextMatch] = util_1.matchBlotTextPartitions(blot, index, MENTION_REGEX);
            if (leftTokenTextMatch) {
                const [, leftTokenText] = leftTokenTextMatch;
                this.insertMention(member, range.index - leftTokenText.length - 1, leftTokenText.length + 1, true);
            }
        }
        insertMention(mention, index, range, withTrailingSpace = false) {
            const delta = new quill_delta_1.default()
                .retain(index)
                .delete(range)
                .insert({ mention });
            if (withTrailingSpace) {
                this.quill.updateContents(delta.insert(' '), 'user');
                this.quill.setSelection(index + 2, 0, 'user');
            }
            else {
                this.quill.updateContents(delta, 'user');
                this.quill.setSelection(index + 1, 0, 'user');
            }
            this.clearResults();
        }
        clearResults() {
            this.results = [];
            this.index = 0;
            this.render();
        }
        onUnmount() {
            document.body.removeChild(this.root);
        }
        render() {
            const { results: memberResults, index: memberResultsIndex } = this;
            if (memberResults.length === 0) {
                this.options.setMentionPickerElement(null);
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
            }, ({ ref, style }) => (react_1.default.createElement("div", { ref: ref, className: "module-composition-input__suggestions", style: style, role: "listbox", "aria-expanded": true, "aria-activedescendant": `mention-result--${memberResults.length ? memberResults[memberResultsIndex].name : ''}`, tabIndex: 0 },
                react_1.default.createElement("div", { ref: this.suggestionListRef, className: "module-composition-input__suggestions--scroller" }, memberResults.map((member, index) => (react_1.default.createElement("button", {
                    type: "button", key: member.uuid, id: `mention-result--${member.name}`, role: "option button", "aria-selected": memberResultsIndex === index, onClick: () => {
                        this.completeMention(index);
                    }, className: classnames_1.default('module-composition-input__suggestions__row', 'module-composition-input__suggestions__row--mention', memberResultsIndex === index
                        ? 'module-composition-input__suggestions__row--selected'
                        : null)
                },
                    react_1.default.createElement(Avatar_1.Avatar, { avatarPath: member.avatarPath, conversationType: "direct", i18n: this.options.i18n, size: 28, title: member.title }),
                    react_1.default.createElement("div", { className: "module-composition-input__suggestions__title" }, member.title)))))))), this.root);
            this.options.setMentionPickerElement(element);
        }
    }
    exports.MentionCompletion = MentionCompletion;
});