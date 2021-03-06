(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.socketStatus = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    function getSocketStatus() {
        const { getSocketStatus: getMessageReceiverStatus } = window;
        return getMessageReceiverStatus();
    }
    exports.getSocketStatus = getSocketStatus;
})();