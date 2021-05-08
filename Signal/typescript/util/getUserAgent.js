require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getUserAgent(appVersion) {
        return `Signal-Desktop/${appVersion}`;
    }
    exports.getUserAgent = getUserAgent;
});