(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.items = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const storageShim = __importStar(window.ts.shims.storage);
    // Action Creators
    exports.actions = {
        putItem,
        putItemExternal,
        removeItem,
        removeItemExternal,
        resetItems,
    };
    function putItem(key, value) {
        storageShim.put(key, value);
        return {
            type: 'items/PUT',
            payload: null,
        };
    }
    function putItemExternal(key, value) {
        return {
            type: 'items/PUT_EXTERNAL',
            payload: {
                key,
                value,
            },
        };
    }
    function removeItem(key) {
        storageShim.remove(key);
        return {
            type: 'items/REMOVE',
            payload: null,
        };
    }
    function removeItemExternal(key) {
        return {
            type: 'items/REMOVE_EXTERNAL',
            payload: key,
        };
    }
    function resetItems() {
        return { type: 'items/RESET' };
    }
    // Reducer
    function getEmptyState() {
        return {};
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === 'items/PUT_EXTERNAL') {
            const { payload } = action;
            return Object.assign(Object.assign({}, state), { [payload.key]: payload.value });
        }
        if (action.type === 'items/REMOVE_EXTERNAL') {
            const { payload } = action;
            return lodash_1.omit(state, payload);
        }
        if (action.type === 'items/RESET') {
            return getEmptyState();
        }
        return state;
    }
    exports.reducer = reducer;
})();