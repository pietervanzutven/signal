/* global window */

(function () {
  'use strict';

  const { ipcRenderer, remote } = window.top.electron;
  const url = window.top.url;
  const i18n = window.top.modules.i18n;
  const { makeGetter, makeSetter } = window.top.preload_utils;

  const { nativeTheme } = remote.require('electron');

  const config = url.parse(window.location.toString(), true).query;
  const { locale } = config;
  const localeMessages = ipcRenderer.sendSync('locale-data');

  window.getEnvironment = () => config.environment;
  window.getVersion = () => config.version;
  window.theme = config.theme;
  window.i18n = i18n.setup(locale, localeMessages);
  window.forCalling = config.forCalling === 'true';
  window.forCamera = config.forCamera === 'true';

  function setSystemTheme() {
    window.systemTheme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  }

  setSystemTheme();

  window.subscribeToSystemThemeChange = fn => {
    nativeTheme.on('updated', () => {
      setSystemTheme();
      fn();
    });
  };

  window.top.log;

  window.closePermissionsPopup = () =>
    ipcRenderer.send('close-permissions-popup');

  window.setMediaPermissions = makeSetter('media-permissions');
  window.setMediaCameraPermissions = makeSetter('media-camera-permissions');
  window.getThemeSetting = makeGetter('theme-setting');
  window.setThemeSetting = makeSetter('theme-setting');
  window.Backbone = window.top.Backbone;
})();