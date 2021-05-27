require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const Emojify_1 = require("./Emojify");
    exports.AtMentionify = ({ bodyRanges, direction, openConversation, text, }) => {
        if (!bodyRanges) {
            return react_1.default.createElement(react_1.default.Fragment, null, text);
        }
        const MENTIONS_REGEX = /(\uFFFC@(\d+))/g;
        let match = MENTIONS_REGEX.exec(text);
        let last = 0;
        const rangeStarts = new Map();
        bodyRanges.forEach(range => {
            rangeStarts.set(range.start, range);
        });
        const results = [];
        while (match) {
            if (last < match.index) {
                const textWithNoMentions = text.slice(last, match.index);
                results.push(textWithNoMentions);
            }
            const rangeStart = Number(match[2]);
            const range = rangeStarts.get(rangeStart);
            if (range) {
                results.push(react_1.default.createElement("span", {
                    className: `module-message-body__at-mention module-message-body__at-mention--${direction}`, key: range.start, onClick: () => {
                        if (openConversation && range.conversationID) {
                            openConversation(range.conversationID);
                        }
                    }, onKeyUp: e => {
                        if (e.target === e.currentTarget &&
                            e.keyCode === 13 &&
                            openConversation &&
                            range.conversationID) {
                            openConversation(range.conversationID);
                        }
                    }, tabIndex: 0, role: "link", "data-id": range.conversationID, "data-title": range.replacementText
                },
                    react_1.default.createElement("bdi", null,
                        "@",
                        react_1.default.createElement(Emojify_1.Emojify, { text: range.replacementText }))));
            }
            last = MENTIONS_REGEX.lastIndex;
            match = MENTIONS_REGEX.exec(text);
        }
        if (last < text.length) {
            results.push(text.slice(last));
        }
        return react_1.default.createElement(react_1.default.Fragment, null, results);
    };
    // At-mentions need to be pre-processed before being pushed through the
    // AtMentionify component, this is due to bodyRanges containing start+length
    // values that operate on the raw string. The text has to be passed through
    // other components before being rendered in the <MessageBody />, components
    // such as Linkify, and Emojify. These components receive the text prop as a
    // string, therefore we're unable to mark it up with DOM nodes prior to handing
    // it off to them. This function will encode the "start" position into the text
    // string so we can later pull it off when rendering the @mention.
    exports.AtMentionify.preprocessMentions = (text, bodyRanges) => {
        if (!bodyRanges || !bodyRanges.length) {
            return text;
        }
        return bodyRanges.reduce((str, range) => {
            const textBegin = str.substr(0, range.start);
            const encodedMention = `\uFFFC@${range.start}`;
            const textEnd = str.substr(range.start + range.length, str.length);
            return `${textBegin}${encodedMention}${textEnd}`;
        }, text);
    };
});