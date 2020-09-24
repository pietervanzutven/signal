(function () {
    'use strict';

    window.uc_micro = window.uc_micro || {};
    window.uc_micro.properties = window.uc_micro.properties || {};
    window.uc_micro.properties.Any = {};
    
    window.uc_micro.properties.Any.regex = /[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/
})();