require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const fuse_js_1 = __importDefault(require("fuse.js"));
    const quill_delta_1 = __importDefault(require("quill-delta"));
    const FUSE_OPTIONS = {
        shouldSort: true,
        threshold: 0.2,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: ['name', 'firstName', 'profileName', 'title'],
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
    class MemberRepository {
        constructor(members = []) {
            this.members = members;
            this.fuse = new fuse_js_1.default(this.members, FUSE_OPTIONS);
        }
        updateMembers(members) {
            this.members = members;
            this.fuse = new fuse_js_1.default(members, FUSE_OPTIONS);
        }
        getMembers(omit) {
            if (omit) {
                return this.members.filter(({ id }) => id !== omit.id);
            }
            return this.members;
        }
        getMemberById(id) {
            return id
                ? this.members.find(({ id: memberId }) => memberId === id)
                : undefined;
        }
        getMemberByUuid(uuid) {
            return uuid
                ? this.members.find(({ uuid: memberUuid }) => memberUuid === uuid)
                : undefined;
        }
        search(pattern, omit) {
            const results = this.fuse.search(pattern);
            if (omit) {
                return results.filter(({ id }) => id !== omit.id);
            }
            return results;
        }
    }
    exports.MemberRepository = MemberRepository;
});