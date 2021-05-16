/* global window */

(function () {
    const { ipcRenderer } = window.top.require('electron');

    const url = window.top.require('url');
    const i18n = window.top.require('./js/modules/i18n');

    const config = url.parse(window.location.toString(), true).query;
    const { locale } = config;
    const localeMessages = ipcRenderer.sendSync('locale-data');

    window.i18n = i18n.setup(locale, localeMessages);
    window.Backbone = window.top.require('backbone');
})();