(function () {
  'use strict';

  window.app = window.app || {};

  const path = window.path;

  const { app } = window.electron;

  const { start } = window.app.base_config;

  const userDataPath = app.getPath('userData');
  const targetPath = path.join(userDataPath, 'ephemeral.json');

  const ephemeralConfig = start('ephemeral', targetPath, {
    allowMalformedOnStartup: true,
  });

  window.app.ephemeral_config = ephemeralConfig;
})();