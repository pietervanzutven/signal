(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util.migrateColor = {};

    // import { missingCaseError } from './missingCaseError';
    Object.defineProperty(exports, "__esModule", { value: true });
    function migrateColor(color) {
        switch (color) {
            // These colors no longer exist
            case 'amber':
            case 'orange':
                return 'red';
            case 'blue_grey':
            case 'light_blue':
                return 'blue';
            case 'deep_purple':
                return 'purple';
            case 'light_green':
                return 'teal';
            // These can stay as they are
            case 'blue':
            case 'cyan':
            case 'deep_orange':
            case 'green':
            case 'grey':
            case 'indigo':
            case 'pink':
            case 'purple':
            case 'red':
            case 'teal':
                return color;
            // Can uncomment this to ensure that we've covered all potential cases
            // default:
            //   throw missingCaseError(color);
            default:
                return 'grey';
        }
    }
    exports.migrateColor = migrateColor;
})();