(function () {
    'use strict';

    window.types = window.types || {};
    const exports = window.types.schema_version = {};

    const { isNumber } = window.lodash;

    exports.isValid = value => isNumber(value) && value >= 0;

})();