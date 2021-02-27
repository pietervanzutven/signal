(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.registration = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const RegistrationSelectors = __importStar(window.ts.state.selectors.registration);
    function markEverDone() {
        // @ts-ignore
        window.storage.put('chromiumRegistrationDoneEver', '');
    }
    exports.markEverDone = markEverDone;
    function markDone() {
        markEverDone();
        // @ts-ignore
        window.storage.put('chromiumRegistrationDone', '');
    }
    exports.markDone = markDone;
    function remove() {
        // @ts-ignore
        window.storage.remove('chromiumRegistrationDone');
    }
    exports.remove = remove;
    function isDone() {
        // @ts-ignore
        return RegistrationSelectors.isDone(window.reduxStore.getState());
    }
    exports.isDone = isDone;
    function everDone() {
        // @ts-ignore
        return RegistrationSelectors.everDone(window.reduxStore.getState());
    }
    exports.everDone = everDone;
})();