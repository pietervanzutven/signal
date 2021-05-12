/* global window */

(function () {
    'use strict';

    const { ipcRenderer } = window.top.ipc;
    const url = window.top.url;
    const copyText = window['copy-text-to-clipboard'];
    const i18n = window.top.modules.i18n;

    const config = url.parse(window.location.toString(), true).query;
    const { locale } = config;
    const localeMessages = ipcRenderer.sendSync('locale-data');

    window.getVersion = () => config.version;
    window.theme = config.theme;
    window.i18n = i18n.setup(locale, localeMessages);
    window.copyText = copyText;

    window.getUWPVersion = () => config.uwp_version;
    window.getEnvironment = () => config.environment;

    window.log = window.top.log;

    window.closeDebugLog = () => ipcRenderer.send('close-debug-log');
    window.Backbone = window.top.Backbone;
})();