(function () {
  'use strict';

  window.app = window.app || {};

  const path = window.path;

  const { start } = window.app.base_config;
  const config = window.app.config;

  // Use separate data directory for development
  if (config.has('storageProfile')) {
    const userData = path.join(
      app.getPath('appData'),
      `Signal-${config.get('storageProfile')}`
    );

    app.setPath('userData', userData);
  }

  console.log(`userData: ${app.getPath('userData')}`);

  const userDataPath = app.getPath('userData');
  const targetPath = path.join(userDataPath, 'config.json');

  const userConfig = start('user', targetPath);

  window.app.user_config = userConfig;
})();