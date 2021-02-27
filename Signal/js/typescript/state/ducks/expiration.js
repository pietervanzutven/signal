(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.expiration = {};

    // State
    Object.defineProperty(exports, "__esModule", { value: true });
    // Actions
    const HYDRATE_EXPIRATION_STATUS = 'expiration/HYDRATE_EXPIRATION_STATUS';
    // Action Creators
    function hydrateExpirationStatus(hasExpired) {
        return {
            type: HYDRATE_EXPIRATION_STATUS,
            payload: hasExpired,
        };
    }
    exports.actions = {
        hydrateExpirationStatus,
    };
    // Reducer
    function getEmptyState() {
        return {
            hasExpired: false,
        };
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === HYDRATE_EXPIRATION_STATUS) {
            return {
                hasExpired: action.payload,
            };
        }
        return state;
    }
    exports.reducer = reducer;
})();