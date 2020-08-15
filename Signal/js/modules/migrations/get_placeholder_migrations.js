(function () {
    'use strict';

    window.migrations = window.migrations || {};
    window.migrations.get_placeholder_migrations = {};

    const Migrations0DatabaseWithAttachmentData =
        window.migrations.migrations_0_database_with_attachment_data;
    const Migrations1DatabaseWithoutAttachmentData =
        window.migrations.migrations_1_database_without_attachment_data;


    window.migrations.get_placeholder_migrations.getPlaceholderMigrations = () => {
        const last0MigrationVersion =
          Migrations0DatabaseWithAttachmentData.getLatestVersion();
        const last1MigrationVersion =
          Migrations1DatabaseWithoutAttachmentData.getLatestVersion();

        const lastMigrationVersion = last1MigrationVersion || last0MigrationVersion;

        return [{
            version: lastMigrationVersion,
            migrate() {
                throw new Error('Unexpected invocation of placeholder migration!' +
                  '\n\nMigrations must explicitly be run upon application startup instead' +
                  ' of implicitly via Backbone IndexedDB adapter at any time.');
            },
        }];
    };
})();