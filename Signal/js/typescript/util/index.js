(function () {
    "use strict";

    window.ts = window.ts || {};
    const exports = window.ts.util;

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const GoogleChrome = __importStar(window.ts.util.GoogleChrome);
    exports.GoogleChrome = GoogleChrome;
    const Registration = __importStar(window.ts.util.registration);
    exports.Registration = Registration;
    const arrayBufferToObjectURL_1 = require_ts_util_arrayBufferToObjectURL();
    exports.arrayBufferToObjectURL = arrayBufferToObjectURL_1.arrayBufferToObjectURL;
    const combineNames_1 = require_ts_util_combineNames();
    exports.combineNames = combineNames_1.combineNames;
    const batcher_1 = require_ts_util_batcher();
    exports.createBatcher = batcher_1.createBatcher;
    const waitBatcher_1 = require_ts_util_waitBatcher();
    exports.createWaitBatcher = waitBatcher_1.createWaitBatcher;
    const hasExpired_1 = require_ts_util_hasExpired();
    exports.hasExpired = hasExpired_1.hasExpired;
    const isFileDangerous_1 = require_ts_util_isFileDangerous();
    exports.isFileDangerous = isFileDangerous_1.isFileDangerous;
    const makeLookup_1 = require_ts_util_makeLookup();
    exports.makeLookup = makeLookup_1.makeLookup;
    const migrateColor_1 = require_ts_util_migrateColor();
    exports.migrateColor = migrateColor_1.migrateColor;
    const missingCaseError_1 = require_ts_util_missingCaseError();
    exports.missingCaseError = missingCaseError_1.missingCaseError;
    const zkgroup = __importStar(require_ts_util_zkgroup());
    exports.zkgroup = zkgroup;
})();