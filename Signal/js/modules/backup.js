/* global Whisper: false */
/* global dcodeIO: false */
/* global _: false */
/* global textsecure: false */
/* global moment: false */
/* global i18n: false */

/* eslint-env browser */
/* eslint-env node */

/* eslint-disable no-param-reassign, guard-for-in */

(function () {

  window.backup = {
    getDirectoryForExport: getDirectoryForExport,
    exportToDirectory: exportToDirectory,
    getDirectoryForImport: getDirectoryForImport,
    importFromDirectory: importFromDirectory,
  };

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
    return folder.getFilesAsync()
      .then(files => {
        return { folder: folder, files: files }
      });
  }

  function createDirectory(parent, name) {
    const sanitized = sanitizeFileName(name);
    console._log('-- about to create directory', sanitized);
    return parent.folder.createFolderAsync(name, Windows.Storage.CreationCollisionOption.replaceExisting)
      .then(folder => {
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

      picker.pickSingleFolderAsync()
        .then(folder => {
          if (!folder) {
            const error = new Error('Error choosing directory');
            error.name = 'ChooseError';
            return reject(error);
          }

          return folder.getFilesAsync()
            .then(files => {
              return resolve({ folder: folder, files: files })
            }, error => {
              return reject(error)
            });
        });
    });
  }

  function getTimestamp() {
    return moment().format('YYYY MMM Do [at] h.mm.ss a');
  }

  function getDirectoryForExport() {
    const options = {
      title: i18n('exportChooserTitle'),
      buttonLabel: i18n('exportButton'),
    };
    return getDirectory(options);
  }

  async function exportToDirectory(directory, options) {
    const name = `Signal Export ${getTimestamp()}`;
    try {
      const db = await openDatabase();
      const dir = await createDirectory(directory, name);
      await exportDatabase(db, dir, options);

      console.log('done backing up!');
      return dir.path;
    } catch (error) {
      console.log(
        'the backup went wrong:',
        error && error.stack ? error.stack : error
      );
      throw error;
    }
  }

  function getDirectoryForImport() {
    const options = {
      title: i18n('importChooserTitle'),
      buttonLabel: i18n('importButton'),
    };
    return getDirectory(options);
  }

  async function importFromDirectory(directory, options) {
    options = options || {};

    try {
      const db = await openDatabase();

      const result = await importDatabase(db, directory, options);
      console.log('done restoring from backup!');
      return result;
    } catch (error) {
      console.log(
        'the import went wrong:',
        error && error.stack ? error.stack : error
      );
      throw error;
    }
  }
}());
