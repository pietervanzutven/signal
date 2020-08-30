/* eslint-env node */

(function () {
    'use strict';

    const exports = window.os = {};

    exports.isMacOS = () => false;

    exports.isLinux = () => false;

    exports.isWindows = () => true;

})();