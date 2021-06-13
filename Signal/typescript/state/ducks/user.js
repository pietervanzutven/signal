require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const events_1 = require("../../shims/events");
    // Action Creators
    exports.actions = {
        userChanged,
        manualReconnect,
    };
    function userChanged(attributes) {
        return {
            type: 'USER_CHANGED',
            payload: attributes,
        };
    }
    function manualReconnect() {
        events_1.trigger('manualConnect');
        return {
            type: 'NOOP',
            payload: null,
        };
    }
    // Reducer
    function getEmptyState() {
        return {
            attachmentsPath: 'missing',
            stickersPath: 'missing',
            tempPath: 'missing',
            ourConversationId: 'missing',
            ourUuid: 'missing',
            ourNumber: 'missing',
            regionCode: 'missing',
            platform: 'missing',
            interactionMode: 'mouse',
            i18n: () => 'missing',
        };
    }
    exports.getEmptyState = getEmptyState;
    function reducer(state = getEmptyState(), action) {
        if (!state) {
            return getEmptyState();
        }
        if (action.type === 'USER_CHANGED') {
            const { payload } = action;
            return Object.assign(Object.assign({}, state), payload);
        }
        return state;
    }
    exports.reducer = reducer;
});