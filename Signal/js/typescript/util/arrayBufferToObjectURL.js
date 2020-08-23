(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util;

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.arrayBufferToObjectURL = ({ data, type, }) => {
        const blob = new Blob([data], { type });
        return URL.createObjectURL(blob);
    };
})();