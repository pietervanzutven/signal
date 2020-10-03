/* global window */

(function () {
    'use strict';

    const ipcRenderer = window.top.ipc;
    const url = window.top.url;
    const i18n = window.top.modules.i18n;

    const config = url.parse(window.location.toString(), true).query;
    const { locale } = config;
    const localeMessages = ipcRenderer.sendSync('locale-data');

    window.theme = config.theme;
    window.i18n = i18n.setup(locale, localeMessages);

    window.getUWPVersion = () => config.uwp_version;
    window.getEnvironment = () => config.environment;

    window.log = window.top.log;

    window.closeDebugLog = () => ipcRenderer.send('close-debug-log');
})();