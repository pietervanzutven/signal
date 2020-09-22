(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.styles = window.ts.styles || {};
    const exports = window.ts.styles.colorSVG = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    exports.colorSVG = (url, color) => {
        return {
            WebkitMask: `url(${url}) no-repeat center`,
            WebkitMaskSize: '100%',
            backgroundColor: color,
        };
    };
})();