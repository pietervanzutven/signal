require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    function getServer() {
        const OLD_USERNAME = window.storage.get('number_id');
        const USERNAME = window.storage.get('uuid_id');
        const PASSWORD = window.storage.get('password');
        return window.WebAPI.connect({
            username: (USERNAME || OLD_USERNAME),
            password: PASSWORD,
        });
    }
    let config = {};
    const listeners = {};
    async function initRemoteConfig() {
        config = window.storage.get('remoteConfig') || {};
        await exports.maybeRefreshRemoteConfig();
    }
    exports.initRemoteConfig = initRemoteConfig;
    function onChange(key, fn) {
        const keyListeners = lodash_1.get(listeners, key, []);
        keyListeners.push(fn);
        listeners[key] = keyListeners;
        return () => {
            listeners[key] = listeners[key].filter(l => l !== fn);
        };
    }
    exports.onChange = onChange;
    exports.refreshRemoteConfig = async () => {
        const now = Date.now();
        const server = getServer();
        const newConfig = await server.getConfig();
        // Process new configuration in light of the old configuration
        // The old configuration is not set as the initial value in reduce because
        // flags may have been deleted
        const oldConfig = config;
        config = newConfig.reduce((previous, { name, enabled }) => {
            const previouslyEnabled = lodash_1.get(oldConfig, [name, 'enabled'], false);
            // If a flag was previously not enabled and is now enabled, record the time it was enabled
            const enabledAt = previouslyEnabled && enabled ? now : lodash_1.get(oldConfig, [name, 'enabledAt']);
            const value = {
                name: name,
                enabled,
                enabledAt,
            };
            // If enablement changes at all, notify listeners
            const currentListeners = listeners[name] || [];
            if (previouslyEnabled !== enabled) {
                currentListeners.forEach(listener => {
                    listener(value);
                });
            }
            // Return new configuration object
            return Object.assign(Object.assign({}, previous), { [name]: value });
        }, {});
        window.storage.put('remoteConfig', config);
    };
    exports.maybeRefreshRemoteConfig = lodash_1.throttle(exports.refreshRemoteConfig,
        // Only fetch remote configuration if the last fetch was more than two hours ago
        2 * 60 * 60 * 1000, { trailing: false });
    function isEnabled(name) {
        return lodash_1.get(config, [name, 'enabled'], false);
    }
    exports.isEnabled = isEnabled;
});