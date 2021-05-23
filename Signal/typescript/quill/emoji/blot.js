require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const quill_1 = __importDefault(require("quill"));
    const react_dom_1 = require("react-dom");
    const Emoji_1 = require("../../components/emoji/Emoji");
    const Embed = quill_1.default.import('blots/embed');
    class EmojiBlot extends Embed {
        static create(emoji) {
            const node = super.create(undefined);
            node.dataset.emoji = emoji;
            const emojiSpan = document.createElement('span');
            react_dom_1.render(react_1.default.createElement(Emoji_1.Emoji, { emoji: emoji, inline: true, size: 20 }, emoji), emojiSpan);
            node.appendChild(emojiSpan);
            return node;
        }
        static value(node) {
            return node.dataset.emoji;
        }
    }
    exports.EmojiBlot = EmojiBlot;
    EmojiBlot.blotName = 'emoji';
    EmojiBlot.tagName = 'span';
    EmojiBlot.className = 'emoji-blot';
});