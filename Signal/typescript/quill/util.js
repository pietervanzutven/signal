require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_delta_1 = __importDefault(require("quill-delta"));
    exports.getTextAndMentionsFromOps = (ops) => {
        const mentions = [];
        const text = ops.reduce((acc, { insert }, index) => {
            if (typeof insert === 'string') {
                let textToAdd;
                switch (index) {
                    case 0: {
                        textToAdd = insert.trimLeft();
                        break;
                    }
                    case ops.length - 1: {
                        textToAdd = insert.trimRight();
                        break;
                    }
                    default: {
                        textToAdd = insert;
                        break;
                    }
                }
                return acc + textToAdd;
            }
            if (insert.emoji) {
                return acc + insert.emoji;
            }
            if (insert.mention) {
                mentions.push({
                    length: 1,
                    mentionUuid: insert.mention.uuid,
                    replacementText: insert.mention.title,
                    start: acc.length,
                });
                return `${acc}\uFFFC`;
            }
            return acc;
        }, '');
        return [text, mentions];
    };
    exports.getDeltaToRemoveStaleMentions = (ops, memberUuids) => {
        const newOps = ops.reduce((memo, op) => {
            if (op.insert) {
                if (op.insert.mention && !memberUuids.includes(op.insert.mention.uuid)) {
                    const deleteOp = { delete: 1 };
                    const textOp = { insert: `@${op.insert.mention.title}` };
                    return [...memo, deleteOp, textOp];
                }
                if (typeof op.insert === 'string') {
                    const retainStringOp = { retain: op.insert.length };
                    return [...memo, retainStringOp];
                }
                const retainEmbedOp = { retain: 1 };
                return [...memo, retainEmbedOp];
            }
            return [...memo, op];
        }, Array());
        return new quill_delta_1.default(newOps);
    };
});