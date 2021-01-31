(function () {
  'use strict';

  window.app = window.app || {};

  const path = window.path;
  const { app } = window.electron;

  let environment;

  // In production mode, UWP_ENV cannot be customized by the user
  if (!app.isPackaged) {
    environment = process.env.UWP_ENV || 'development';
  } else {
    environment = 'production';
  }

  // Set environment vars to configure uwp-config before requiring it
  process.env.UWP_ENV = environment;
  process.env.UWP_CONFIG_DIR = path.join(__dirname, '..', 'config');

  if (environment === 'production') {
    // harden production config against the local env
    process.env.UWP_CONFIG = '';
    process.env.UWP_CONFIG_STRICT_MODE = true;
    process.env.HOSTNAME = '';
    process.env.UWP_APP_INSTANCE = '';
    process.env.ALLOW_CONFIG_MUTATIONS = '';
    process.env.SUPPRESS_NO_CONFIG_WARNING = '';
    process.env.UWP_TLS_REJECT_UNAUTHORIZED = '';
    process.env.SIGNAL_ENABLE_HTTP = '';
  }

  // We load config after we've made our modifications to UWP_ENV
  const config = window.require_config();

  config.environment = environment;
  config.enableHttp = process.env.SIGNAL_ENABLE_HTTP;

  // Log resulting env vars in use by config
  [
    'UWP_ENV',
    'UWP_CONFIG_DIR',
    'UWP_CONFIG',
    'ALLOW_CONFIG_MUTATIONS',
    'HOSTNAME',
    'UWP_APP_INSTANCE',
    'SUPPRESS_NO_CONFIG_WARNING',
    'SIGNAL_ENABLE_HTTP',
  ].forEach(s => {
    console.log(`${s} ${config.util.getEnv(s)}`);
  });

  window.app.config = config;

})();