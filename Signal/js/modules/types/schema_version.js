(function () {
    const isNumber = window.lodash.isNumber;


    window.types = window.types || {};
    window.types.schema_version = {
        isValid: value =>
            isNumber(value) && value >= 0,
    }
})();