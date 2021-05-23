require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function isMuted(muteExpiresAt) {
        return Boolean(muteExpiresAt && Date.now() < muteExpiresAt);
    }
    exports.isMuted = isMuted;
});