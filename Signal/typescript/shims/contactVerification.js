require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function toggleVerification(id) {
        const contact = window.getConversations().get(id);
        if (contact) {
            await contact.toggleVerified();
        }
    }
    exports.toggleVerification = toggleVerification;
    async function reloadProfiles(id) {
        const contact = window.getConversations().get(id);
        if (contact) {
            await contact.getProfiles();
        }
    }
    exports.reloadProfiles = reloadProfiles;
});