require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable max-classes-per-file */
    const react_1 = __importDefault(require("react"));
    const parchment_1 = __importDefault(require("parchment"));
    const quill_1 = __importDefault(require("quill"));
    const react_dom_1 = require("react-dom");
    const Emojify_1 = require("../../components/conversation/Emojify");
    const Embed = quill_1.default.import('blots/embed');
    class MentionBlot extends Embed {
        constructor(node) {
            super(node);
            this.contentNode.removeAttribute('contenteditable');
        }
        static create(value) {
            const node = super.create(undefined);
            MentionBlot.buildSpan(value, node);
            return node;
        }
        static value(node) {
            const { uuid, title } = node.dataset;
            if (uuid === undefined || title === undefined) {
                throw new Error(`Failed to make MentionBlot with uuid: ${uuid} and title: ${title}`);
            }
            return {
                uuid,
                title,
            };
        }
        static buildSpan(mention, node) {
            node.setAttribute('data-uuid', mention.uuid || '');
            node.setAttribute('data-title', mention.title || '');
            const mentionSpan = document.createElement('span');
            react_dom_1.render(react_1.default.createElement("span", { className: "module-composition-input__at-mention" },
                react_1.default.createElement("bdi", null,
                    "@",
                    react_1.default.createElement(Emojify_1.Emojify, { text: mention.title }))), mentionSpan);
            node.appendChild(mentionSpan);
        }
    }
    exports.MentionBlot = MentionBlot;
    MentionBlot.blotName = 'mention';
    MentionBlot.className = 'mention-blot';
    MentionBlot.tagName = 'span';
});