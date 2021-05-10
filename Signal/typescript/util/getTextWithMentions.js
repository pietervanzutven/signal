require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getTextWithMentions(bodyRanges, text) {
        return bodyRanges.reduce((str, range) => {
            const textBegin = str.substr(0, range.start);
            const textEnd = str.substr(range.start + range.length, str.length);
            return `${textBegin}@${range.replacementText}${textEnd}`;
        }, text);
    }
    exports.getTextWithMentions = getTextWithMentions;
});