/* global setTimeout */

(function () {
    'use strict';
    
    const exports = window.sleep = {};

    exports.sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

})();