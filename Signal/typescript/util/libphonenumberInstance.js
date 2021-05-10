require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const google_libphonenumber_1 = __importDefault(require("google-libphonenumber"));
    const instance = google_libphonenumber_1.default.PhoneNumberUtil.getInstance();
    exports.instance = instance;
    const { PhoneNumberFormat } = google_libphonenumber_1.default;
    exports.PhoneNumberFormat = PhoneNumberFormat;
});