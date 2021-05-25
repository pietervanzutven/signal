require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_delta_1 = __importDefault(require("quill-delta"));
    exports.isMentionBlot = (blot) => blot.value() && blot.value().mention;
    exports.isRetainOp = (op) => op !== undefined && op.retain !== undefined;
    exports.isSpecificInsertOp = (op, type) => {
        return (op.insert !== undefined &&
            typeof op.insert === 'object' &&
            Object.hasOwnProperty.call(op.insert, type));
    };
    exports.isInsertEmojiOp = (op) => exports.isSpecificInsertOp(op, 'emoji');
    exports.isInsertMentionOp = (op) => exports.isSpecificInsertOp(op, 'mention');
    exports.getTextFromOps = (ops) => ops.reduce((acc, { insert }, index) => {
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
            const textWithoutNewlines = textToAdd.replace(/\n+$/, '');
            return acc + textWithoutNewlines;
        }
        if (insert.emoji) {
            return acc + insert.emoji;
        }
        if (insert.mention) {
            return `${acc}@${insert.mention.title}`;
        }
        return acc;
    }, '');
    exports.getTextAndMentionsFromOps = (ops) => {
        const mentions = [];
        const text = ops.reduce((acc, op, index) => {
            if (typeof op.insert === 'string') {
                let textToAdd;
                switch (index) {
                    case 0: {
                        textToAdd = op.insert.trimLeft();
                        break;
                    }
                    case ops.length - 1: {
                        textToAdd = op.insert.trimRight();
                        break;
                    }
                    default: {
                        textToAdd = op.insert;
                        break;
                    }
                }
                const textWithoutNewlines = textToAdd.replace(/\n+$/, '');
                return acc + textWithoutNewlines;
            }
            if (exports.isInsertEmojiOp(op)) {
                return acc + op.insert.emoji;
            }
            if (exports.isInsertMentionOp(op)) {
                mentions.push({
                    length: 1,
                    mentionUuid: op.insert.mention.uuid,
                    replacementText: op.insert.mention.title,
                    start: acc.length,
                });
                return `${acc}\uFFFC`;
            }
            return acc;
        }, '');
        return [text, mentions];
    };
    exports.getBlotTextPartitions = (blot, index) => {
        if (blot !== undefined && blot.text !== undefined) {
            const leftLeafText = blot.text.substr(0, index);
            const rightLeafText = blot.text.substr(index);
            return [leftLeafText, rightLeafText];
        }
        return ['', ''];
    };
    exports.matchBlotTextPartitions = (blot, index, leftRegExp, rightRegExp) => {
        const [leftText, rightText] = exports.getBlotTextPartitions(blot, index);
        const leftMatch = leftRegExp.exec(leftText);
        let rightMatch = null;
        if (rightRegExp) {
            rightMatch = rightRegExp.exec(rightText);
        }
        return [leftMatch, rightMatch];
    };
    exports.getDeltaToRestartMention = (ops) => {
        const changes = ops.reduce((acc, op) => {
            if (op.insert && typeof op.insert === 'string') {
                acc.push({ retain: op.insert.length });
            }
            else {
                acc.push({ retain: 1 });
            }
            return acc;
        }, Array());
        changes.push({ delete: 1 });
        changes.push({ insert: '@' });
        return new quill_delta_1.default(changes);
    };
    exports.getDeltaToRemoveStaleMentions = (ops, memberUuids) => {
        const newOps = ops.reduce((memo, op) => {
            if (op.insert) {
                if (exports.isInsertMentionOp(op) &&
                    !memberUuids.includes(op.insert.mention.uuid)) {
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