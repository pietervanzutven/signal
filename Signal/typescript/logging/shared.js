require(exports => {
    "use strict";
    // Copyright 2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cleanArgs = exports.getLogLevelString = exports.isLogEntry = exports.LogLevel = void 0;
    const privacy_1 = require("../../js/modules/privacy");
    const missingCaseError_1 = require("../util/missingCaseError");
    const reallyJsonStringify_1 = require("../util/reallyJsonStringify");
    // These match [Bunyan's recommendations][0].
    // [0]: https://www.npmjs.com/package/bunyan#levels
    var LogLevel;
    (function (LogLevel) {
        LogLevel[LogLevel["Fatal"] = 60] = "Fatal";
        LogLevel[LogLevel["Error"] = 50] = "Error";
        LogLevel[LogLevel["Warn"] = 40] = "Warn";
        LogLevel[LogLevel["Info"] = 30] = "Info";
        LogLevel[LogLevel["Debug"] = 20] = "Debug";
        LogLevel[LogLevel["Trace"] = 10] = "Trace";
    })(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
    const logLevels = new Set([
        LogLevel.Fatal,
        LogLevel.Error,
        LogLevel.Warn,
        LogLevel.Info,
        LogLevel.Debug,
        LogLevel.Trace,
    ]);
    function isLogLevel(value) {
        return typeof value === 'number' && logLevels.has(value);
    }
    function isValidTime(value) {
        return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
    }
    function isLogEntry(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return false;
        }
        const { level, time, msg } = value;
        return typeof msg === 'string' && isLogLevel(level) && isValidTime(time);
    }
    exports.isLogEntry = isLogEntry;
    function getLogLevelString(value) {
        switch (value) {
            case LogLevel.Fatal:
                return 'fatal';
            case LogLevel.Error:
                return 'error';
            case LogLevel.Warn:
                return 'warn';
            case LogLevel.Info:
                return 'info';
            case LogLevel.Debug:
                return 'debug';
            case LogLevel.Trace:
                return 'trace';
            default:
                throw missingCaseError_1.missingCaseError(value);
        }
    }
    exports.getLogLevelString = getLogLevelString;
    function cleanArgs(args) {
        return privacy_1.redactAll(args
            .map(item => typeof item === 'string' ? item : reallyJsonStringify_1.reallyJsonStringify(item))
            .join(' '));
    }
    exports.cleanArgs = cleanArgs;
});