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
    const react_1 = __importDefault(require("react"));
    class AddNewLines extends react_1.default.Component {
        render() {
            const { text, renderNonNewLine } = this.props;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const results = [];
            const FIND_NEWLINES = /\n/g;
            // We have to do this, because renderNonNewLine is not required in our Props object,
            //  but it is always provided via defaultProps.
            if (!renderNonNewLine) {
                return null;
            }
            let match = FIND_NEWLINES.exec(text);
            let last = 0;
            let count = 1;
            if (!match) {
                return renderNonNewLine({ text, key: 0 });
            }
            while (match) {
                if (last < match.index) {
                    const textWithNoNewline = text.slice(last, match.index);
                    count += 1;
                    results.push(renderNonNewLine({ text: textWithNoNewline, key: count }));
                }
                count += 1;
                results.push(react_1.default.createElement("br", { key: count }));
                last = FIND_NEWLINES.lastIndex;
                match = FIND_NEWLINES.exec(text);
            }
            if (last < text.length) {
                count += 1;
                results.push(renderNonNewLine({ text: text.slice(last), key: count }));
            }
            return results;
        }
    }
    exports.AddNewLines = AddNewLines;
    AddNewLines.defaultProps = {
        renderNonNewLine: ({ text }) => text,
    };
})();