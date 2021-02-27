(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.selectors = window.ts.state.selectors || {};
    const exports = window.ts.state.selectors.network = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = window.reselect;
    const registration_1 = window.ts.state.selectors.registration;
    const getNetwork = (state) => state.network;
    exports.hasNetworkDialog = reselect_1.createSelector(getNetwork, registration_1.isDone, ({ isOnline, socketStatus, withinConnectingGracePeriod }, isRegistrationDone) => !isOnline ||
        !isRegistrationDone ||
        (socketStatus === WebSocket.CONNECTING && !withinConnectingGracePeriod) ||
        socketStatus === WebSocket.CLOSED ||
        socketStatus === WebSocket.CLOSING);
})();