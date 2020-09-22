(function () {
    "use strict";

    window.ts = window.ts || {};
    const exports = window.ts.OS = {}

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const is_1 = __importDefault(window.sindresorhus.is);
    const os_1 = __importDefault(window.os);
    const semver_1 = __importDefault(window.semver);
    exports.isMacOS = () => process.platform === 'darwin';
    exports.isLinux = () => process.platform === 'linux';
    exports.isWindows = (minVersion) => {
        const isPlatformValid = process.platform === 'win32';
        const osRelease = os_1.default.release();
        const isVersionValid = is_1.default.undefined(minVersion)
            ? true
            : semver_1.default.gte(osRelease, minVersion);
        return isPlatformValid && isVersionValid;
    };
})();