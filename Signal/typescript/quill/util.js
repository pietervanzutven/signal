require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const emoji_regex_1 = __importDefault(require("emoji-regex"));
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
    exports.getTextFromOps = (ops) => ops
        .reduce((acc, op) => {
            if (typeof op.insert === 'string') {
                return acc + op.insert;
            }
            if (exports.isInsertEmojiOp(op)) {
                return acc + op.insert.emoji;
            }
            if (exports.isInsertMentionOp(op)) {
                return `${acc}@${op.insert.mention.title}`;
            }
            return acc;
        }, '')
        .trim();
    exports.getTextAndMentionsFromOps = (ops) => {
        const mentions = [];
        const text = ops
            .reduce((acc, op) => {
                if (typeof op.insert === 'string') {
                    return acc + op.insert;
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
            }, '')
            .trim();
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
    exports.insertMentionOps = (incomingOps, bodyRanges) => {
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
    exports.insertEmojiOps = (incomingOps) => {
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
});