/* eslint-env node */

(function () {
    'use strict';

    const exports = window.os = {};

    exports.release = () => {
        const version = Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamilyVersion;
        const build = ((version & 0x00000000FFFF0000) >> 16);
        return build > 10240 ? '10.0.0' : '8.0.0';
    };
})();