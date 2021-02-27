(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.ducks = window.ts.state.ducks || {};
    const exports = window.ts.state.ducks.updates = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const Dialogs_1 = window.ts.types.Dialogs;
    const updateIpc = __importStar(window.ts.shims.updateIpc);
    // Actions
    const ACK_RENDER = 'updates/ACK_RENDER';
    const DISMISS_DIALOG = 'updates/DISMISS_DIALOG';
    const SHOW_UPDATE_DIALOG = 'updates/SHOW_UPDATE_DIALOG';
    const START_UPDATE = 'updates/START_UPDATE';
    // Action Creators
    function ackRender() {
        updateIpc.ackRender();
        return {
            type: ACK_RENDER,
        };
    }
    function dismissDialog() {
        return {
            type: DISMISS_DIALOG,
        };
    }
    function showUpdateDialog(dialogType) {
        return {
            type: SHOW_UPDATE_DIALOG,
            payload: dialogType,
        };
    }
    function startUpdate() {
        updateIpc.startUpdate();
        return {
            type: START_UPDATE,
        };
    }
    exports.actions = {
        ackRender,
        dismissDialog,
        showUpdateDialog,
        startUpdate,
    };
    // Reducer
    function getEmptyState() {
        return {
            dialogType: Dialogs_1.Dialogs.None,
        };
    }
    function reducer(state = getEmptyState(), action) {
        if (action.type === SHOW_UPDATE_DIALOG) {
            return {
                dialogType: action.payload,
            };
        }
        if (action.type === DISMISS_DIALOG &&
            state.dialogType === Dialogs_1.Dialogs.MacOS_Read_Only) {
            return {
                dialogType: Dialogs_1.Dialogs.None,
            };
        }
        return state;
    }
    exports.reducer = reducer;
})();