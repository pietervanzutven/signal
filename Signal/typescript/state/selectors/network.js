require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const reselect_1 = require("reselect");
    const registration_1 = require("../../util/registration");
    const getNetwork = (state) => state.network;
    exports.hasNetworkDialog = reselect_1.createSelector(getNetwork, registration_1.isDone, ({ isOnline, socketStatus, withinConnectingGracePeriod }, isRegistrationDone) => isRegistrationDone &&
        (!isOnline ||
            (socketStatus === WebSocket.CONNECTING && !withinConnectingGracePeriod) ||
            socketStatus === WebSocket.CLOSED ||
            socketStatus === WebSocket.CLOSING));
});