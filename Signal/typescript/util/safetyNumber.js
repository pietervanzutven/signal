require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function generateSecurityNumber(ourNumber, ourKey, theirNumber, theirKey) {
        return new window.libsignal.FingerprintGenerator(5200).createFor(ourNumber, ourKey, theirNumber, theirKey);
    }
    exports.generateSecurityNumber = generateSecurityNumber;
    function getPlaceholder() {
        return Array.from(Array(12))
            .map(() => 'XXXXX')
            .join(' ');
    }
    exports.getPlaceholder = getPlaceholder;
    async function generateSecurityNumberBlock(contact) {
        const ourNumber = window.textsecure.storage.user.getNumber();
        const ourUuid = window.textsecure.storage.user.getUuid();
        const us = window.textsecure.storage.protocol.getIdentityRecord(ourUuid || ourNumber);
        const ourKey = us ? us.publicKey : null;
        const them = window.textsecure.storage.protocol.getIdentityRecord(contact.id);
        const theirKey = them ? them.publicKey : null;
        if (!ourKey) {
            throw new Error('Could not load our key');
        }
        if (!theirKey) {
            throw new Error('Could not load their key');
        }
        const securityNumber = await generateSecurityNumber(ourNumber, ourKey, contact.e164, theirKey);
        const chunks = [];
        for (let i = 0; i < securityNumber.length; i += 5) {
            chunks.push(securityNumber.substring(i, i + 5));
        }
        return chunks;
    }
    exports.generateSecurityNumberBlock = generateSecurityNumberBlock;
});