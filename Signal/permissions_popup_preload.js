/* global window */

(function () {
  'use strict';

  const ipcRenderer = window.top.ipc;
  const url = window.top.url;
  const i18n = window.modules.i18n;

  const config = url.parse(window.location.toString(), true).query;
  const { locale } = config;
  const localeMessages = ipcRenderer.sendSync('locale-data');

  window.getVersion = () => config.version;
  window.theme = config.theme;
  window.i18n = i18n.setup(locale, localeMessages);

  window.log = window.top.log;

  window.closePermissionsPopup = () =>
    ipcRenderer.send('close-permissions-popup');

  window.getMediaPermissions = makeGetter('media-permissions');
  window.setMediaPermissions = makeSetter('media-permissions');

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