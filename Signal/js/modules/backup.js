/* global Signal: false */
/* global Whisper: false */
/* global dcodeIO: false */
/* global _: false */
/* global textsecure: false */
/* global i18n: false */

/* eslint-env browser */
/* eslint-env node */

/* eslint-disable no-param-reassign, guard-for-in */

(function () {
  'use strict';

  window.backup = {
    getDirectoryForExport,
    exportToDirectory,
    getDirectoryForImport,
    importFromDirectory,
  };

  async function copyFolder(source, dest) {
    const files = await source.getFilesAsync();
    files.forEach(async file => await file.copyAsync(dest, file.name, Windows.Storage.NameCollisionOption.replaceExisting));
    const folders = await source.getFoldersAsync();
    folders.forEach(async folder => await copyFolder(folder, await dest.createFolderAsync(folder.name, Windows.Storage.CreationCollisionOption.openIfExists)));
  }

  async function exportDatabase(idb_db, parent) {
    await copyFolder(idb_db, parent);
  }

  async function importDatabase(idb_db, parent) {
    await copyFolder(parent, idb_db);
  }

  async function openDatabase() {
    return Windows.Storage.ApplicationData.current.localFolder;
  }

  async function createDirectory(parent, name) {
    const sanitized = _sanitizeFileName(name);
    console._log('-- about to create directory', sanitized);
    return await parent.createFolderAsync(name, Windows.Storage.CreationCollisionOption.failIfExists);
  }

  function _sanitizeFileName(filename) {
    return filename.toString().replace(/[^a-z0-9.,+()'#\- ]/gi, '_');
  }

  async function getDirectory(options) {
    var picker = Windows.Storage.Pickers.FolderPicker();
    picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
    picker.fileTypeFilter.append("*");

    const folder = await picker.pickSingleFolderAsync();
    if (!folder) {
      const error = new Error('Error choosing directory');
      error.name = 'ChooseError';
      throw error;
    } else {
      return folder;
    }
  }

  function getTimestamp() {
    return moment().format('YYYY MMM Do [at] h.mm.ss a');
  }

  async function getDirectoryForExport() {
    const options = {
      title: i18n('exportChooserTitle'),
      buttonLabel: i18n('exportButton'),
    };
    return await getDirectory(options);
  }

  async function exportToDirectory(directory) {
    const name = `Signal Export ${getTimestamp()}`;
    try {
      const db = await openDatabase();
      const dir = await createDirectory(directory, name);
      await exportDatabase(db, dir);

      console.log('done backing up!');
      return dir.path;
    } catch (error) {
      console.log(
        'The backup went wrong!',
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

      console.log('Done importing!');
      return result;
    } catch (error) {
      console.log(
        'The import went wrong!',
        error && error.stack ? error.stack : error
      );
      throw error;
    }
  }
}());
