(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.events = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // Matching Whisper.events.trigger API
    // eslint-disable-next-line max-len
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    function trigger(name, param1, param2) {
        window.Whisper.events.trigger(name, param1, param2);
    }
    exports.trigger = trigger;
})();