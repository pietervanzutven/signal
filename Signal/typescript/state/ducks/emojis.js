(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.emojis = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const Client_1 = __importDefault(require("../../sql/Client"));
    const hooks_1 = require("../../util/hooks");
    const { updateEmojiUsage } = Client_1.default;
    // Action Creators
    exports.actions = {
        onUseEmoji,
    };
    exports.useActions = () => hooks_1.useBoundActions(exports.actions);
    function onUseEmoji({ shortName }) {
        return {
            type: 'emojis/USE_EMOJI',
            payload: doUseEmoji(shortName),
        };
    }
    async function doUseEmoji(shortName) {
        await updateEmojiUsage(shortName);
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
            return Object.assign(Object.assign({}, state), { recents: lodash_1.take(lodash_1.uniq([payload, ...state.recents]), 32) });
        }
        return state;
    }
    exports.reducer = reducer;
})();