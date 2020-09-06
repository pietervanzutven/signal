(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.util = window.ts.util || {};
    const exports = window.ts.util;

    Object.defineProperty(exports, "__esModule", { value: true });
    const libphonenumberInstance_1 = window.ts.util.libphonenumberInstance;
    function formatPhoneNumber(phoneNumber, options) {
        try {
            const { ourRegionCode } = options;
            const parsedNumber = libphonenumberInstance_1.instance.parse(phoneNumber);
            const regionCode = libphonenumberInstance_1.instance.getRegionCodeForNumber(parsedNumber);
            if (ourRegionCode && regionCode === ourRegionCode) {
                return libphonenumberInstance_1.instance.format(parsedNumber, libphonenumberInstance_1.PhoneNumberFormat.NATIONAL);
            }
            return libphonenumberInstance_1.instance.format(parsedNumber, libphonenumberInstance_1.PhoneNumberFormat.INTERNATIONAL);
        }
        catch (error) {
            return phoneNumber;
        }
    }
    exports.formatPhoneNumber = formatPhoneNumber;
})();