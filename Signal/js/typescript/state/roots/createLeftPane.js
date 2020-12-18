(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.roots = window.ts.state.roots || {};
    const exports = window.ts.state.roots.createLeftPane = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const react_redux_1 = window.react_redux;
    const LeftPane_1 = window.ts.state.smart.LeftPane;
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    const FilteredLeftPane = LeftPane_1.SmartLeftPane;
    exports.createLeftPane = (store) => (react_1.default.createElement(react_redux_1.Provider, { store: store },
        react_1.default.createElement(FilteredLeftPane, null)));
})();