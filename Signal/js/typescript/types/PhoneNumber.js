(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.types = window.ts.types || {};
    const exports = window.ts.types.PhoneNumber = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const libphonenumberInstance_1 = window.ts.util.libphonenumberInstance;
    const memoizee_1 = __importDefault(window.memoizee);
    function _format(phoneNumber, options) {
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
    exports.format = memoizee_1.default(_format, {
        primitive: true,
        // Convert the arguments to a unique string, required for primitive mode.
        normalizer: (...args) => JSON.stringify(args),
        max: 5000,
    });
    function parse(phoneNumber, options) {
        const { regionCode } = options;
        const parsedNumber = libphonenumberInstance_1.instance.parse(phoneNumber, regionCode);
        if (libphonenumberInstance_1.instance.isValidNumber(parsedNumber)) {
            return libphonenumberInstance_1.instance.format(parsedNumber, libphonenumberInstance_1.PhoneNumberFormat.E164);
        }
        return phoneNumber;
    }
    exports.parse = parse;
    function normalize(phoneNumber, options) {
        const { regionCode } = options;
        try {
            const parsedNumber = libphonenumberInstance_1.instance.parse(phoneNumber, regionCode);
            if (libphonenumberInstance_1.instance.isValidNumber(parsedNumber)) {
                return libphonenumberInstance_1.instance.format(parsedNumber, libphonenumberInstance_1.PhoneNumberFormat.E164);
            }
            return;
        }
        catch (error) {
            return;
        }
    }
    exports.normalize = normalize;
})();