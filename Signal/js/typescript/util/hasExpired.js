function require_ts_util_hasExpired() {
    "use strict";
    const exports = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const env = window.getEnvironment();
    const NINETY_ONE_DAYS = 86400 * 91 * 1000;
    function hasExpired() {
        const { getExpiration, log } = window;
        let buildExpiration = 0;
        try {
            buildExpiration = parseInt(getExpiration(), 10);
            if (buildExpiration) {
                log.info('Build expires: ', new Date(buildExpiration).toISOString());
            }
        }
        catch (e) {
            log.error('Error retrieving build expiration date', e.stack);
            return true;
        }
        const tooFarIntoFuture = Date.now() + NINETY_ONE_DAYS < buildExpiration;
        if (tooFarIntoFuture) {
            log.error('Build expiration is set too far into the future', buildExpiration);
        }
        if (env === 'production') {
            return Date.now() > buildExpiration && tooFarIntoFuture;
        }
        return buildExpiration && Date.now() > buildExpiration;
    }
    exports.hasExpired = hasExpired;

    return exports;
}