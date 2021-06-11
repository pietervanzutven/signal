require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
        useEmoji,
    };
    exports.useActions = () => hooks_1.useBoundActions(exports.actions);
    function onUseEmoji({ shortName, }) {
        return async (dispatch) => {
            try {
                await updateEmojiUsage(shortName);
                dispatch(useEmoji(shortName));
            }
            catch (err) {
                // Errors are ignored.
            }
        };
    }
    function useEmoji(payload) {
        return {
            type: 'emojis/USE_EMOJI',
            payload,
        };
    }
    // Reducer
    function getEmptyState() {
        return {
            recents: [],
        };
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'emojis/USE_EMOJI') {
            const { payload } = action;
            return Object.assign(Object.assign({}, state), { recents: lodash_1.take(lodash_1.uniq([payload, ...state.recents]), 32) });
        }
        return state;
    }
    exports.reducer = reducer;
});