require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
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
        config = newConfig.reduce((acc, { name, enabled, value }) => {
            const previouslyEnabled = lodash_1.get(oldConfig, [name, 'enabled'], false);
            const previousValue = lodash_1.get(oldConfig, [name, 'value'], undefined);
            // If a flag was previously not enabled and is now enabled,
            // record the time it was enabled
            const enabledAt = previouslyEnabled && enabled ? now : lodash_1.get(oldConfig, [name, 'enabledAt']);
            const configValue = {
                name: name,
                enabled,
                enabledAt,
                value,
            };
            const hasChanged = previouslyEnabled !== enabled || previousValue !== configValue.value;
            // If enablement changes at all, notify listeners
            const currentListeners = listeners[name] || [];
            if (hasChanged) {
                window.log.info(`Remote Config: Flag ${name} has changed`);
                currentListeners.forEach(listener => {
                    listener(configValue);
                });
            }
            // Return new configuration object
            return Object.assign(Object.assign({}, acc), { [name]: configValue });
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
    function getValue(name) {
        return lodash_1.get(config, [name, 'value'], undefined);
    }
    exports.getValue = getValue;
});