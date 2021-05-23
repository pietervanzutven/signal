require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    function getTextWithMentions(bodyRanges, text) {
        return bodyRanges
            .sort((a, b) => b.start - a.start)
            .reduce((acc, { start, length, replacementText }) => {
                const left = acc.slice(0, start);
                const right = acc.slice(start + length);
                return `${left}@${replacementText}${right}`;
            }, text);
    }
    exports.getTextWithMentions = getTextWithMentions;
});