(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.shims = window.ts.shims || {};
    const exports = window.ts.shims.socketStatus = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const unknownWindow = window;
    const shimmedWindow = unknownWindow;
    function getSocketStatus() {
        const { getSocketStatus: getMessageReceiverStatus } = shimmedWindow;
        return getMessageReceiverStatus();
    }
    exports.getSocketStatus = getSocketStatus;
})();