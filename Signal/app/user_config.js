(function () {
    'use strict';

    window.app = window.app || {};
    
    const path = window.path;

    const UWPConfig = window.uwp_config;

    const config = window.app.config;

    // use a separate data directory for development
    if (config.has('storageProfile')) {
        const userData = path.join(
          app.getPath('appData'),
          `Signal-${config.get('storageProfile')}`
        );

        app.setPath('userData', userData);
    }

    console.log(`userData: ${app.getPath('userData')}`);

    // this needs to be below our update to the appData path
    const userConfig = new UWPConfig();

    window.app.user_config = userConfig;
})();