require(exports => {
    "use strict";
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
        return window.storage.get('chromiumRegistrationDone') === '';
    }
    exports.isDone = isDone;
    function everDone() {
        return window.storage.get('chromiumRegistrationDoneEver') === '' || isDone();
    }
    exports.everDone = everDone;
});