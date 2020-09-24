'use strict';

(function () {
    window.path = {
        join: function () {
            return Array.prototype.slice.call(arguments).join('/');
        },
    }
    window.__dirname = 'ms-appx://';
})();