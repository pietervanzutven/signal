(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util;

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const is_1 = __importDefault(window.sindresorhus.is);
    exports.arrayBufferToObjectURL = ({ data, type, }) => {
        if (!is_1.default.arrayBuffer(data)) {
            throw new TypeError('`data` must be an ArrayBuffer');
        }
        const blob = new Blob([data], { type });
        return URL.createObjectURL(blob);
    };
})();