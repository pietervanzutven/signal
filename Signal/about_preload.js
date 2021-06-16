// Copyright 2018-2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

/* global window */

(function () {
    const { ipcRenderer } = window.top.require('electron');
    const url = window.top.require('url');
    const i18n = window.top.require('./js/modules/i18n');

    const config = url.parse(window.location.toString(), true).query;
    const { locale } = config;
    const localeMessages = ipcRenderer.sendSync('locale-data');

    window.getEnvironment = () => config.environment;
    window.getVersion = () => config.version;
    window.getAppInstance = () => config.appInstance;

    window.closeAbout = () => ipcRenderer.send('close-about');

    window.i18n = i18n.setup(locale, localeMessages);

    window.top.require('./ts/logging/set_up_renderer_logging');
})();