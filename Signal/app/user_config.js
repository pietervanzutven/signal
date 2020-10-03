(function () {
    'use strict';
    
    const path = window.path;

    const UWPConfig = window.uwp_config;

    const config = window.config;

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

    window.user_config = userConfig;
})();