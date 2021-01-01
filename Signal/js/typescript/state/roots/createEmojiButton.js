(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.roots = window.ts.state.roots || {};
    const exports = window.ts.state.roots.createEmojiButton = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const react_redux_1 = window.react_redux;
    const EmojiButton_1 = window.ts.state.smart.EmojiButton;
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    const FilteredEmojiButton = EmojiButton_1.SmartEmojiButton;
    exports.createEmojiButton = (store, props) => (react_1.default.createElement(react_redux_1.Provider, { store: store },
        react_1.default.createElement(FilteredEmojiButton, Object.assign({}, props))));
})();