require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_delta_1 = __importDefault(require("quill-delta"));
    exports.matchEmojiImage = (node) => {
        if (node.classList.contains('emoji')) {
            const emoji = node.getAttribute('title');
            return new quill_delta_1.default().insert({ emoji });
        }
        return new quill_delta_1.default();
    };
    exports.matchEmojiBlot = (node, delta) => {
        if (node.classList.contains('emoji-blot')) {
            const { emoji } = node.dataset;
            return new quill_delta_1.default().insert({ emoji });
        }
        return delta;
    };
    exports.matchReactEmoji = (node, delta) => {
        if (node.classList.contains('module-emoji')) {
            const emoji = node.innerText.trim();
            return new quill_delta_1.default().insert({ emoji });
        }
        return delta;
    };
});