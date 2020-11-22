/* global window */

(function () {
  'use strict';

  window.migrations = window.migrations || {};
  const exports = window.migrations.migrations_1_database_without_attachment_data = {};

  const { last } = window.lodash;

  const db = window.database;
  const settings = window.settings;
  const { runMigrations } = window.migrations.run_migrations;

  // These are migrations for after the SQLCipher migration, currently not running
  exports.migrations = [
    {
      version: 20,
      migrate(transaction, next) {
        window.log.info('Migration 20');
        window.log.info(
          'Removing messages, unprocessed, and conversations object stores'
        );

        // This should be run after things are migrated to SQLCipher
        transaction.db.deleteObjectStore('messages');
        transaction.db.deleteObjectStore('unprocessed');
        transaction.db.deleteObjectStore('conversations');

        next();
      },
    },
  ];

  exports.run = async ({ Backbone, logger } = {}) => {
    const database = {
      id: 'signal',
      nolog: true,
      migrations: exports.migrations,
    };

    const { canRun } = await exports.getStatus({ database });
    if (!canRun) {
      throw new Error(
        'Cannot run migrations on database without attachment data'
      );
    }

    await runMigrations({
      Backbone,
      logger,
      database,
    });
  };

  exports.getStatus = async ({ database } = {}) => {
    const connection = await db.open(database.id, database.version);
    const isAttachmentMigrationComplete = await settings.isAttachmentMigrationComplete(
      connection
    );
    const hasMigrations = exports.migrations.length > 0;

    const canRun = isAttachmentMigrationComplete && hasMigrations;
    return {
      isAttachmentMigrationComplete,
      hasMigrations,
      canRun,
    };
  };

  exports.getLatestVersion = () => {
    const lastMigration = last(exports.migrations);
    if (!lastMigration) {
      return null;
    }

    return lastMigration.version;
  };
})();