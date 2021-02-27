(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.updater = window.ts.updater || {};
    const exports = window.ts.updater.index = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const config_1 = require_config();
    const macos_1 = window.ts.updater.macos;
    const windows_1 = window.ts.updater.windows;
    let initialized = false;
    async function start(getMainWindow, messages, logger) {
        const { platform } = process;
        if (initialized) {
            throw new Error('updater/start: Updates have already been initialized!');
        }
        initialized = true;
        if (!messages) {
            throw new Error('updater/start: Must provide messages!');
        }
        if (!logger) {
            throw new Error('updater/start: Must provide logger!');
        }
        if (autoUpdateDisabled()) {
            logger.info('updater/start: Updates disabled - not starting new version checks');
            return;
        }
        if (platform === 'win32') {
            await windows_1.start(getMainWindow, messages, logger);
        }
        else if (platform === 'darwin') {
            await macos_1.start(getMainWindow, messages, logger);
        }
        else {
            throw new Error('updater/start: Unsupported platform');
        }
    }
    exports.start = start;
    function autoUpdateDisabled() {
        return (process.platform === 'linux' ||
            process.mas ||
            !config_1.get('updatesEnabled'));
    }
})();