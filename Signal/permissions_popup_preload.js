/* global window */

(function () {
  'use strict';

  const { ipcRenderer, remote } = window.top.electron;
  const url = window.top.url;
  const i18n = window.modules.i18n;

  const { systemPreferences } = remote.require('electron');

  const config = url.parse(window.location.toString(), true).query;
  const { locale } = config;
  const localeMessages = ipcRenderer.sendSync('locale-data');

  window.getVersion = () => config.version;
  window.theme = config.theme;
  window.i18n = i18n.setup(locale, localeMessages);

  function setSystemTheme() {
    window.systemTheme = systemPreferences.isDarkMode() ? 'dark' : 'light';
  }

  setSystemTheme();

  window.subscribeToSystemThemeChange = fn => {
    if (!systemPreferences.subscribeNotification) {
      return;
    }
    systemPreferences.subscribeNotification(
      'AppleInterfaceThemeChangedNotification',
      () => {
        setSystemTheme();
        fn();
      }
    );
  };

  require('./js/logging');

  window.closePermissionsPopup = () =>
    ipcRenderer.send('close-permissions-popup');

  window.getMediaPermissions = makeGetter('media-permissions');
  window.setMediaPermissions = makeSetter('media-permissions');
  window.getThemeSetting = makeGetter('theme-setting');
  window.setThemeSetting = makeSetter('theme-setting');

  function makeGetter(name) {
    return () =>
      new Promise((resolve, reject) => {
        ipcRenderer.once(`get-success-${name}`, (event, error, value) => {
          if (error) {
            return reject(error);
          }

          return resolve(value);
        });
        ipcRenderer.send(`get-${name}`);
      });
  }

  function makeSetter(name) {
    return value =>
      new Promise((resolve, reject) => {
        ipcRenderer.once(`set-success-${name}`, (event, error) => {
          if (error) {
            return reject(error);
          }

          return resolve();
        });
        ipcRenderer.send(`set-${name}`, value);
      });
  }
})();