require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const ShortcutGuideModal_1 = require("../smart/ShortcutGuideModal");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const FilteredShortcutGuideModal = ShortcutGuideModal_1.SmartShortcutGuideModal;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    exports.createShortcutGuideModal = (store, props) => (react_1.default.createElement(react_redux_1.Provider, { store: store },
        react_1.default.createElement(FilteredShortcutGuideModal, Object.assign({}, props))));
});