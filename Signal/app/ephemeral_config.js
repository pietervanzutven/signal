(function () {
    'use strict';

    window.app = window.app || {};

    const path = window.path;

    const { start } = window.app.base_config;

    const userDataPath = app.getPath('userData');
    const targetPath = path.join(userDataPath, 'ephemeral.json');

    const ephemeralConfig = start('ephemeral', targetPath);

    window.app.ephemeral_config = ephemeralConfig;
})();