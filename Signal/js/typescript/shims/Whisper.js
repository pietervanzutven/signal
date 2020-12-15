(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.Whisper = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    function getMessageModel(attributes) {
        // @ts-ignore
        return new window.Whisper.Message(attributes);
    }
    exports.getMessageModel = getMessageModel;
})();