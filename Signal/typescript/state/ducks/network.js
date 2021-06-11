require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const events_1 = require("../../shims/events");
    const assignWithNoUnnecessaryAllocation_1 = require("../../util/assignWithNoUnnecessaryAllocation");
    // Actions
    const CHECK_NETWORK_STATUS = 'network/CHECK_NETWORK_STATUS';
    const CLOSE_CONNECTING_GRACE_PERIOD = 'network/CLOSE_CONNECTING_GRACE_PERIOD';
    const RELINK_DEVICE = 'network/RELINK_DEVICE';
    // Action Creators
    function checkNetworkStatus(payload) {
        return {
            type: CHECK_NETWORK_STATUS,
            payload,
        };
    }
    function closeConnectingGracePeriod() {
        return {
            type: CLOSE_CONNECTING_GRACE_PERIOD,
        };
    }
    function relinkDevice() {
        events_1.trigger('setupAsNewDevice');
        return {
            type: RELINK_DEVICE,
        };
    }
    exports.actions = {
        checkNetworkStatus,
        closeConnectingGracePeriod,
        relinkDevice,
    };
    // Reducer
    function getEmptyState() {
        return {
            isOnline: navigator.onLine,
            socketStatus: WebSocket.OPEN,
            withinConnectingGracePeriod: true,
        };
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === CHECK_NETWORK_STATUS) {
            const { isOnline, socketStatus } = action.payload;
            // This action is dispatched frequently. We avoid allocating a new object if nothing
            //   has changed to avoid an unnecessary re-render.
            return assignWithNoUnnecessaryAllocation_1.assignWithNoUnnecessaryAllocation(state, {
                isOnline,
                socketStatus,
            });
        }
        if (action.type === CLOSE_CONNECTING_GRACE_PERIOD) {
            return Object.assign(Object.assign({}, state), { withinConnectingGracePeriod: false });
        }
        return state;
    }
    exports.reducer = reducer;
});