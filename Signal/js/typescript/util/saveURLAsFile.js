(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.saveURLAsFile = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    exports.saveURLAsFile = ({ filename, url, document, }) => {
        const anchorElement = document.createElement('a');
        anchorElement.href = url;
        anchorElement.download = filename;
        anchorElement.click();
    };
})();