(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.AddNewLines = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    class AddNewLines extends react_1.default.Component {
        render() {
            const { text } = this.props;
            const results = [];
            const FIND_NEWLINES = /\n/g;
            let match = FIND_NEWLINES.exec(text);
            let last = 0;
            let count = 1;
            if (!match) {
                return react_1.default.createElement("span", null, text);
            }
            while (match) {
                if (last < match.index) {
                    const textWithNoNewline = text.slice(last, match.index);
                    results.push(react_1.default.createElement("span", { key: count++ }, textWithNoNewline));
                }
                results.push(react_1.default.createElement("br", { key: count++ }));
                // @ts-ignore
                last = FIND_NEWLINES.lastIndex;
                match = FIND_NEWLINES.exec(text);
            }
            if (last < text.length) {
                results.push(react_1.default.createElement("span", { key: count++ }, text.slice(last)));
            }
            return react_1.default.createElement("span", null, results);
        }
    }
    exports.AddNewLines = AddNewLines;
})();