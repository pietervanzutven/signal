/* global window */

(function () {
    const { ipcRenderer } = window.top.require('electron');
    const url = window.top.require('url');
    const copyText = window.top.require('copy-text-to-clipboard');
    const i18n = window.top.require('./js/modules/i18n');

    const config = url.parse(window.location.toString(), true).query;
    const { locale } = config;
    const localeMessages = ipcRenderer.sendSync('locale-data');

    window.getVersion = () => config.version;
    window.theme = config.theme;
    window.i18n = i18n.setup(locale, localeMessages);
    window.copyText = copyText;

    // got.js appears to need this to successfully submit debug logs to the cloud
    window.nodeSetImmediate = setImmediate;

    window.getNodeVersion = () => config.node_version;
    window.getEnvironment = () => config.environment;

    window.top.require('./js/logging');

    window.closeDebugLog = () => ipcRenderer.send('close-debug-log');
    window.Backbone = window.top.require('backbone');
})();