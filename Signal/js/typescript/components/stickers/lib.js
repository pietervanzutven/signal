(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.stickers = window.ts.components.stickers || {};
    const exports = window.ts.components.stickers.lib = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // This function exists to force stickers to be counted consistently wherever
    // they are counted (TypeScript ensures that all data is named and provided)
    function countStickers(o) {
        return (o.knownPacks.length +
            o.blessedPacks.length +
            o.installedPacks.length +
            o.receivedPacks.length);
    }
    exports.countStickers = countStickers;
})();