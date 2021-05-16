require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const StickerPreviewModal_1 = require("../smart/StickerPreviewModal");
    // Workaround: A react component's required properties are filtering up through connect()
    //   https://github.com/DefinitelyTyped/DefinitelyTyped/issues/31363
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const FilteredStickerPreviewModal = StickerPreviewModal_1.SmartStickerPreviewModal;
    /* eslint-enable @typescript-eslint/no-explicit-any */
    exports.createStickerPreviewModal = (store, props) => (react_1.default.createElement(react_redux_1.Provider, { store: store },
        react_1.default.createElement(FilteredStickerPreviewModal, Object.assign({}, props))));
});