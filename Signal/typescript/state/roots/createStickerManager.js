require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const react_redux_1 = require("react-redux");
    const StickerManager_1 = require("../smart/StickerManager");
    exports.createStickerManager = (store) => (react_1.default.createElement(react_redux_1.Provider, { store: store },
        react_1.default.createElement(StickerManager_1.SmartStickerManager, null)));
});