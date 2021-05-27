require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const quill_delta_1 = __importDefault(require("quill-delta"));
    exports.matchMention = (memberRepositoryRef) => (node, delta) => {
        const memberRepository = memberRepositoryRef.current;
        if (memberRepository) {
            const { title } = node.dataset;
            if (node.classList.contains('module-message-body__at-mention')) {
                const { id } = node.dataset;
                const conversation = memberRepository.getMemberById(id);
                if (conversation && conversation.uuid) {
                    return new quill_delta_1.default().insert({
                        mention: {
                            title,
                            uuid: conversation.uuid,
                        },
                    });
                }
                return new quill_delta_1.default().insert(`@${title}`);
            }
            if (node.classList.contains('mention-blot')) {
                const { uuid } = node.dataset;
                const conversation = memberRepository.getMemberByUuid(uuid);
                if (conversation && conversation.uuid) {
                    return new quill_delta_1.default().insert({
                        mention: {
                            title: title || conversation.title,
                            uuid: conversation.uuid,
                        },
                    });
                }
                return new quill_delta_1.default().insert(`@${title}`);
            }
        }
        return delta;
    };
});