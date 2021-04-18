(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.registration = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    function markEverDone() {
        // @ts-ignore
        window.storage.put('chromiumRegistrationDoneEver', '');
    }
    exports.markEverDone = markEverDone;
    function markDone() {
        markEverDone();
        window.storage.put('chromiumRegistrationDone', '');
    }
    exports.markDone = markDone;
    function remove() {
        window.storage.remove('chromiumRegistrationDone');
    }
    exports.remove = remove;
    function isDone() {
        // tslint:disable-next-line no-backbone-get-set-outside-model
        return window.storage.get('chromiumRegistrationDone') === '';
    }
    exports.isDone = isDone;
    function everDone() {
        // tslint:disable-next-line no-backbone-get-set-outside-model
        return window.storage.get('chromiumRegistrationDoneEver') === '' || isDone();
    }
    exports.everDone = everDone;
})();