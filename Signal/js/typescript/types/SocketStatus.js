(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.SocketStatus = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // Maps to values found here: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/readyState
    // which are returned by libtextsecure's MessageReceiver
    var SocketStatus;
    (function (SocketStatus) {
        SocketStatus[SocketStatus["CONNECTING"] = 0] = "CONNECTING";
        SocketStatus[SocketStatus["OPEN"] = 1] = "OPEN";
        SocketStatus[SocketStatus["CLOSING"] = 2] = "CLOSING";
        SocketStatus[SocketStatus["CLOSED"] = 3] = "CLOSED";
    })(SocketStatus = exports.SocketStatus || (exports.SocketStatus = {}));
})();