require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function markEverDone() {
        window.storage.put('chromiumRegistrationDoneEver', '');
    }
    exports.markEverDone = markEverDone;
    function markDone() {
        markEverDone();
        window.storage.put('chromiumRegistrationDone', '');
    }
    exports.markDone = markDone;
    async function remove() {
        await window.storage.remove('chromiumRegistrationDone');
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