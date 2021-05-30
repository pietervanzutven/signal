require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_1 = __importDefault(require("quill"));
    const Block = quill_1.default.import('blots/block');
    class DirectionalBlot extends Block {
        static create(value) {
            const node = super.create(value);
            node.setAttribute('dir', 'auto');
            return node;
        }
    }
    exports.DirectionalBlot = DirectionalBlot;
    DirectionalBlot.tagName = 'div';
});