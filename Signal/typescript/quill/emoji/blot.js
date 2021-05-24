require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_1 = __importDefault(require("quill"));
    const lib_1 = require("../../components/emoji/lib");
    const Embed = quill_1.default.import('blots/embed');
    // the DOM structure of this EmojiBlot should match the other emoji implementations:
    // ts/components/conversation/Emojify.tsx
    // ts/components/emoji/Emoji.tsx
    class EmojiBlot extends Embed {
        static create(emoji) {
            const node = super.create(undefined);
            node.dataset.emoji = emoji;
            const image = lib_1.emojiToImage(emoji);
            node.setAttribute('src', image || '');
            node.setAttribute('data-emoji', emoji);
            node.setAttribute('title', emoji);
            node.setAttribute('aria-label', emoji);
            return node;
        }
        static value(node) {
            return node.dataset.emoji;
        }
    }
    exports.EmojiBlot = EmojiBlot;
    EmojiBlot.blotName = 'emoji';
    EmojiBlot.tagName = 'img';
    EmojiBlot.className = 'emoji-blot';
});