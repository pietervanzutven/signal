(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.user = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const events_1 = window.ts.shims.events;
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
})();