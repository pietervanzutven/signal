(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.roots = window.ts.state.roots || {};
    const exports = window.ts.state.roots.createStickerManager = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const StickerManager_1 = require("../smart/StickerManager");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const FilteredStickerManager = StickerManager_1.SmartStickerManager;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    exports.createStickerManager = (store) => (react_1.default.createElement(react_redux_1.Provider, { store: store },
        react_1.default.createElement(FilteredStickerManager, null)));
})();