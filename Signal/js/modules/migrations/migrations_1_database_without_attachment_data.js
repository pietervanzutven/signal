(function () {
  window.migrations = window.migrations || {};
  window.migrations.migrations_1_database_without_attachment_data = {};

  const { runMigrations } = window.migrations.run_migrations;


  window.migrations.migrations_1_database_without_attachment_data.migrations = [
    // {
    //   version: 18,
    //   async migrate(transaction, next) {
    //     console.log('Migration 18');
    //     console.log('Attachments stored on disk');
    //     next();
    //   },
    // },
  ];

  window.migrations.migrations_1_database_without_attachment_data.run = runMigrations;
})();