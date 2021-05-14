require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const uuid_1 = require("uuid");
    const timeoutStore = new Map();
    const allTimeouts = new Set();
    setInterval(() => {
        if (!allTimeouts.size) {
            return;
        }
        const now = Date.now();
        allTimeouts.forEach((timeout) => {
            const { timestamp, uuid } = timeout;
            if (now >= timestamp) {
                if (timeoutStore.has(uuid)) {
                    const callback = timeoutStore.get(uuid);
                    if (callback) {
                        callback();
                    }
                    timeoutStore.delete(uuid);
                }
                allTimeouts.delete(timeout);
            }
        });
    }, 100);
    function onTimeout(timestamp, callback, id) {
        if (id && timeoutStore.has(id)) {
            throw new ReferenceError(`onTimeout: ${id} already exists`);
        }
        let uuid = id || uuid_1.v4();
        while (timeoutStore.has(uuid)) {
            uuid = uuid_1.v4();
        }
        timeoutStore.set(uuid, callback);
        allTimeouts.add({
            timestamp,
            uuid,
        });
        return uuid;
    }
    exports.onTimeout = onTimeout;
    function removeTimeout(uuid) {
        if (timeoutStore.has(uuid)) {
            timeoutStore.delete(uuid);
        }
        allTimeouts.forEach((timeout) => {
            if (uuid === timeout.uuid) {
                allTimeouts.delete(timeout);
            }
        });
    }
    exports.removeTimeout = removeTimeout;
});