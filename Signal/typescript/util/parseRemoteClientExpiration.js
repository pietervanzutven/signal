require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const semver_1 = __importDefault(require("semver"));
    function parseRemoteClientExpiration(remoteExpirationValue) {
        const remoteVersions = JSON.parse(remoteExpirationValue) || [];
        const ourVersion = window.getVersion();
        return remoteVersions.reduce((acc, remoteVersion) => {
            const minVersion = remoteVersion['min-version'];
            const { iso8601 } = remoteVersion;
            if (semver_1.default.gt(minVersion, ourVersion)) {
                const timestamp = new Date(iso8601).getTime();
                if (!acc) {
                    return timestamp;
                }
                return timestamp < acc ? timestamp : acc;
            }
            return acc;
        }, null);
    }
    exports.parseRemoteClientExpiration = parseRemoteClientExpiration;
});