(function () {
    'use strict';
    
    window.settings = {};

    const { isObject, isString } = window.lodash;


    const ITEMS_STORE_NAME = 'items';
    const LAST_PROCESSED_INDEX_KEY = 'attachmentMigration_lastProcessedIndex';
    const IS_MIGRATION_COMPLETE_KEY = 'attachmentMigration_isComplete';

    // Public API
    window.settings.READ_RECEIPT_CONFIGURATION_SYNC = 'read-receipt-configuration-sync';

    window.settings.getAttachmentMigrationLastProcessedIndex = connection =>
        window.settings._getItem(connection, LAST_PROCESSED_INDEX_KEY);

    window.settings.setAttachmentMigrationLastProcessedIndex = (connection, value) =>
        window.settings._setItem(connection, LAST_PROCESSED_INDEX_KEY, value);

    window.settings.deleteAttachmentMigrationLastProcessedIndex = connection =>
        window.settings._deleteItem(connection, LAST_PROCESSED_INDEX_KEY);

    window.settings.isAttachmentMigrationComplete = async connection =>
        Boolean(await window.settings._getItem(connection, IS_MIGRATION_COMPLETE_KEY));

    window.settings.markAttachmentMigrationComplete = connection =>
        window.settings._setItem(connection, IS_MIGRATION_COMPLETE_KEY, true);

    // Private API
    window.settings._getItem = (connection, key) => {
        if (!isObject(connection)) {
            throw new TypeError('"connection" is required');
        }

        if (!isString(key)) {
            throw new TypeError('"key" must be a string');
        }

        const transaction = connection.transaction(ITEMS_STORE_NAME, 'readonly');
        const itemsStore = transaction.objectStore(ITEMS_STORE_NAME);
        const request = itemsStore.get(key);
        return new Promise((resolve, reject) => {
            request.onerror = event =>
                reject(event.target.error);

            request.onsuccess = event =>
                resolve(event.target.result ? event.target.result.value : null);
        });
    };

    window.settings._setItem = (connection, key, value) => {
        if (!isObject(connection)) {
            throw new TypeError('"connection" is required');
        }

        if (!isString(key)) {
            throw new TypeError('"key" must be a string');
        }

        const transaction = connection.transaction(ITEMS_STORE_NAME, 'readwrite');
        const itemsStore = transaction.objectStore(ITEMS_STORE_NAME);
        const request = itemsStore.put({ id: key, value }, key);
        return new Promise((resolve, reject) => {
            request.onerror = event =>
                reject(event.target.error);

            request.onsuccess = () =>
                resolve();
        });
    };

    window.settings._deleteItem = (connection, key) => {
        if (!isObject(connection)) {
            throw new TypeError('"connection" is required');
        }

        if (!isString(key)) {
            throw new TypeError('"key" must be a string');
        }

        const transaction = connection.transaction(ITEMS_STORE_NAME, 'readwrite');
        const itemsStore = transaction.objectStore(ITEMS_STORE_NAME);
        const request = itemsStore.delete(key);
        return new Promise((resolve, reject) => {
            request.onerror = event =>
                reject(event.target.error);

            request.onsuccess = () =>
                resolve();
        });
    };
})();