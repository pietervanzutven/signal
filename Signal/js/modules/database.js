(function () {
    window.database = {};

    /* global indexedDB */

    // Module for interacting with IndexedDB without Backbone IndexedDB adapter
    // and using promises. Revisit use of `idb` dependency as it might cover
    // this functionality.

    const { isObject } = window.lodash;


    window.database.open = (name, version) => {
        const request = indexedDB.open(name, version);
        return new Promise((resolve, reject) => {
            request.onblocked = () =>
                reject(new Error('Database blocked'));

            request.onupgradeneeded = event =>
                reject(new Error('Unexpected database upgrade required:' +
                    `oldVersion: ${event.oldVersion}, newVersion: ${event.newVersion}`));

            request.onerror = event =>
                reject(event.target.error);

            request.onsuccess = (event) => {
                const connection = event.target.result;
                resolve(connection);
            };
        });
    };

    window.database.completeTransaction = transaction =>
        new Promise((resolve, reject) => {
            transaction.addEventListener('abort', event => reject(event.target.error));
            transaction.addEventListener('error', event => reject(event.target.error));
            transaction.addEventListener('complete', () => resolve());
        });

    window.database.getVersion = async (name) => {
        const connection = await window.database.open(name);
        const { version } = connection;
        connection.close();
        return version;
    };

    window.database.getCount = async ({ store } = {}) => {
        if (!isObject(store)) {
            throw new TypeError('"store" is required');
        }

        const request = store.count();
        return new Promise((resolve, reject) => {
            request.onerror = event =>
                reject(event.target.error);
            request.onsuccess = event =>
                resolve(event.target.result);
        });
    };
})();