// Copyright 2018-2020 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

/* global window */

(function () {
  window.React = window.top.require('react');
  window.ReactDOM = window.top.require('react-dom');

  const { ipcRenderer, remote } = window.top.require('electron');
  const url = window.top.require('url');
  const i18n = window.top.require('./js/modules/i18n');
  const { ConfirmationModal } = window.top.require('./ts/components/ConfirmationModal');
  const { makeGetter, makeSetter } = window.top.require('./preload_utils');

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
  window.Signal = {
    Components: {
      ConfirmationModal,
    },
  };

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

  window.top.require('./js/logging');

  window.closePermissionsPopup = () =>
    ipcRenderer.send('close-permissions-popup');

  window.setMediaPermissions = makeSetter('media-permissions');
  window.setMediaCameraPermissions = makeSetter('media-camera-permissions');
  window.getThemeSetting = makeGetter('theme-setting');
  window.setThemeSetting = makeSetter('theme-setting');
  window.Backbone = window.top.require('backbone');
})();