(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.user = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    // Action Creators
    exports.actions = {
        userChanged,
    };
    function userChanged(attributes) {
        return {
            type: 'USER_CHANGED',
            payload: attributes,
        };
    }
    // Reducer
    function getEmptyState() {
        return {
            ourNumber: 'missing',
            regionCode: 'missing',
            i18n: () => 'missing',
        };
    }
    function reducer(state, action) {
        if (!state) {
            return getEmptyState();
        }
        if (action.type === 'USER_CHANGED') {
            const { payload } = action;
            return Object.assign({}, state, payload);
        }
        return state;
    }
    exports.reducer = reducer;
})();