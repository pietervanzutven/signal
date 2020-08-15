/* global setTimeout */

(function () {
    window.sleep = {};

    window.sleep.sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));
})();