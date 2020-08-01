/* global dcodeIO: false */
/* global _: false */
/* global Whisper: false */
/* global textsecure: false */
/* global moment: false */
/* global i18n: false */

/* eslint-env node */

/* eslint-disable no-param-reassign, more/no-then, guard-for-in */

'use strict';

// eslint-disable-next-line func-names
(function() {
  window.Whisper = window.Whisper || {};

  function exportDatabase(idb_db, parent) {
    const promises = [];
    idb_db.files.forEach(file => promises.push(file.copyAsync(parent, file.name, Windows.Storage.NameCollisionOption.replaceExisting)));
    return Promise.all(promises);
  }

  function importDatabase(idb_db, parent) {
    const promises = [];
    parent.files.forEach(file => {
      var fileName = file.name === 'signal.json' ? 'signal_import.json' : file.name;
      promises.push(file.copyAsync(idb_db.folder, fileName, Windows.Storage.NameCollisionOption.replaceExisting));
    });
    return Promise.all(promises);
  }

  function openDatabase() {
    const folder = Windows.Storage.ApplicationData.current.localFolder;
    return folder.getFilesAsync().then(function (files) {
      return { folder: folder, files: files }
    });
  }

  function createDirectory(parent, name) {
    const sanitized = sanitizeFileName(name);
    console._log('-- about to create directory', sanitized);
    return parent.folder.createFolderAsync(name, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {
      return folder;
    });
  }

  function sanitizeFileName(filename) {
    return filename.toString().replace(/[^a-z0-9.,+()'#\- ]/gi, '_');
  }

  function getDirectory(options) {
    return new Promise(function(resolve, reject) {
      var picker = Windows.Storage.Pickers.FolderPicker();
      picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
      picker.fileTypeFilter.append("*");
      picker.pickSingleFolderAsync().then(function(folder) {
        if (folder) {
          return folder.getFilesAsync()
            .then(files => {
              return resolve({ folder: folder, files: files })
            }, error => {
              return reject(error)
            });
        } else {
          const error = new Error('Error choosing directory');
          error.name = 'ChooseError';
          return reject(error);
        }
      });
    });
  }
 
  function getTimestamp() {
    return moment().format('YYYY MMM Do [at] h.mm.ss a');
  }

  // directories returned and taken by backup/import are all string paths
  Whisper.Backup = {
    getDirectoryForExport() {
      const options = {
        title: i18n('exportChooserTitle'),
        buttonLabel: i18n('exportButton'),
      };
      return getDirectory(options);
    },
    exportToDirectory(directory, options) {
      let dir;
      let db;
      return openDatabase().then((openedDb) => {
        db = openedDb;
        const name = `Signal Export ${getTimestamp()}`;
        return createDirectory(directory, name);
      }).then((created) => {
        dir = created;
        return exportDatabase(db, dir, options);
      }).then(() => dir.path)
        .then((targetPath) => {
          console.log('done backing up!');
          return targetPath;
        }, (error) => {
          console.log(
            'the backup went wrong:',
            error && error.stack ? error.stack : error
          );
          return Promise.reject(error);
        });
    },
    getDirectoryForImport() {
      const options = {
        title: i18n('importChooserTitle'),
        buttonLabel: i18n('importButton'),
      };
      return getDirectory(options);
    },
    importFromDirectory(directory, options) {
      options = options || {};

      let db;
      let nonMessageResult;
      return openDatabase().then((createdDb) => {
        db = createdDb;

        return importDatabase(idb_db, directory);
      }).then(() => directory)
        .then((result) => {
          nonMessageResult = result;
        })
        .then(() => {
          console.log('done restoring from backup!');
          return nonMessageResult;
        }, (error) => {
          console.log(
            'the import went wrong:',
            error && error.stack ? error.stack : error
          );
          return Promise.reject(error);
        });
    },
  };
}());
