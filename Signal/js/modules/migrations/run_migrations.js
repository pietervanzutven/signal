/* eslint-env browser */

(function () {
    window.migrations = window.migrations || {};
    window.migrations.run_migrations = {};

    const {
        head,
        isFunction,
        isObject,
        isString,
        last,
    } = window.lodash;


    const db = window.database;
    const { deferredToPromise } = window.deferred_to_promise;


    const closeDatabaseConnection = ({ Backbone } = {}) =>
        deferredToPromise(Backbone.sync('closeall'));

    window.migrations.run_migrations.runMigrations = async ({ Backbone, database } = {}) => {
        if (!isObject(Backbone) || !isObject(Backbone.Collection) ||
            !isFunction(Backbone.Collection.extend)) {
            throw new TypeError('"Backbone" is required');
        }

        if (!isObject(database) || !isString(database.id) ||
            !Array.isArray(database.migrations)) {
            throw new TypeError('"database" is required');
        }

        const {
            firstVersion: firstMigrationVersion,
            lastVersion: lastMigrationVersion,
        } = getMigrationVersions(database);

        const databaseVersion = await db.getVersion(database.id);
        const isAlreadyUpgraded = databaseVersion >= lastMigrationVersion;

        console.log('Database status', {
            firstMigrationVersion,
            lastMigrationVersion,
            databaseVersion,
            isAlreadyUpgraded,
        });

        if (isAlreadyUpgraded) {
            return;
        }

        const migrationCollection = new (Backbone.Collection.extend({
            database,
            storeName: 'items',
        }))();

        await deferredToPromise(migrationCollection.fetch({ limit: 1 }));
        console.log('Close database connection');
        await closeDatabaseConnection({ Backbone });
    };

    const getMigrationVersions = (database) => {
        if (!isObject(database) || !Array.isArray(database.migrations)) {
            throw new TypeError('"database" is required');
        }

        const firstMigration = head(database.migrations);
        const lastMigration = last(database.migrations);

        const firstVersion = firstMigration ? parseInt(firstMigration.version, 10) : null;
        const lastVersion = lastMigration ? parseInt(lastMigration.version, 10) : null;

        return { firstVersion, lastVersion };
    };
})();