(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.emojis = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const data_1 = window.data;
    // Action Creators
    exports.actions = {
        useEmoji,
    };
    function useEmoji({ shortName }) {
        return {
            type: 'emojis/USE_EMOJI',
            payload: doUseEmoji(shortName),
        };
    }
    async function doUseEmoji(shortName) {
        await data_1.updateEmojiUsage(shortName);
        return shortName;
    }
    // Reducer
    function getEmptyState() {
        return {
            recents: [],
        };
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'emojis/USE_EMOJI_FULFILLED') {
            const { payload } = action;
            return Object.assign({}, state, { recents: lodash_1.take(lodash_1.uniq([payload, ...state.recents]), 32) });
        }
        return state;
    }
    exports.reducer = reducer;
})();