require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const fuse_js_1 = __importDefault(require("fuse.js"));
    const FUSE_OPTIONS = {
        location: 0,
        shouldSort: true,
        threshold: 0,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        tokenize: true,
        keys: ['name', 'firstName', 'profileName', 'title'],
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
            const results = this.fuse.search(`${pattern}`);
            if (omit) {
                return results.filter(({ id }) => id !== omit.id);
            }
            return results;
        }
    }
    exports.MemberRepository = MemberRepository;
});