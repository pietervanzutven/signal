/* eslint-env node */

(function () {
    window.os = {};

    window.os.isMacOS = () =>
        process.platform === 'darwin';

    window.os.isLinux = () =>
        process.platform === 'linux';

    window.os.isWindows = () =>
        process.platform === 'win32';
})();