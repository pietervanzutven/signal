/* global window */

(function () {
    'use strict';

    const { ipcRenderer } = window.top.electron;

    const url = window.top.url;
    const i18n = window.top.i18n;

    const config = url.parse(window.location.toString(), true).query;
    const { locale } = config;
    const localeMessages = ipcRenderer.sendSync('locale-data');

    window.i18n = i18n.setup(locale, localeMessages);
})();