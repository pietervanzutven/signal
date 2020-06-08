;(function () {
    'use strict';
    window.Whisper = window.Whisper || {};

    function exportDatabase(idb_db, parent) {
        var promises = [];
        idb_db.files.forEach(file => promises.push(file.copyAsync(parent, file.name, Windows.Storage.NameCollisionOption.replaceExisting)));
        return Promise.all(promises);
    }

    function importDatabase(idb_db, parent) {
        var promises = [];
        parent.files.forEach(file => {
            var fileName = file.name === 'signal.json' ? 'signal_import.json' : file.name;
            promises.push(file.copyAsync(idb_db.folder, fileName, Windows.Storage.NameCollisionOption.replaceExisting));
        });
        return Promise.all(promises);
    }

    function openDatabase() {
        var folder = Windows.Storage.ApplicationData.current.localFolder;
        return folder.getFilesAsync().then(function (files) {
            return { folder: folder, files: files }
        });
    }

    function createDirectory(parent, name) {
        var sanitized = sanitizeFileName(name);
        console._log('-- about to create directory', sanitized);
        return parent.folder.createFolderAsync(name, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (folder) {
            return folder;
        });
    }

    function sanitizeFileName(filename) {
        return filename.toString().replace(/[^a-z0-9.,+()'#\- ]/gi, '_');
    }

    function getDirectory() {
        return new Promise(function(resolve, reject) {
            var picker = Windows.Storage.Pickers.FolderPicker();
            picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            picker.fileTypeFilter.append("*");
            picker.pickSingleFolderAsync().then(function(folder) {
                if (folder) {
                    folder.getFilesAsync().then(files => resolve({ folder: folder, files: files }), error => reject(error));
                } else {
                    var error = new Error('Error choosing directory');
                    error.name = 'ChooseError';
                    reject(error);
                }
            });
        });
    }

    function clearAllStores(idb_db) {
        var promises = [];
        idb_db.files.forEach(file => promises.push(file.deleteAsync()));
        return Promise.all(promises);
    }

    function getDisplayPath(entry) {
        return new Promise(function(resolve) {
            resolve(entry.path);
        });
    }

    function getTimestamp() {
        return moment().format('YYYY MMM Do [at] h.mm.ss a');
    }

    Whisper.Backup = {
        clearDatabase: function() {
            return openDatabase().then(function(idb_db) {
                return clearAllStores(idb_db);
            });
        },
        getDirectoryForExport: function() {
            var options = {
                title: i18n('exportChooserTitle'),
                buttonLabel: i18n('exportButton'),
            };
            return getDirectory(options);
        },
        backupToDirectory: function (directory) {
            var idb;
            var dir;
            return openDatabase().then(function (idb_db) {
                idb = idb_db;
                var name = 'Signal Export ' + getTimestamp();
                return createDirectory(directory, name);
            }).then(function (created) {
                dir = created;
                return exportDatabase(idb, dir);
            }).then(function () {
                return dir.path;
            }).then(function (path) {
                console.log('done backing up!');
                return path;
            }, function (error) {
                console.log(
                  'the backup went wrong:',
                  error && error.stack ? error.stack : error
                );
                return Promise.reject(error);
            });
        },
        getDirectoryForImport: function() {
            var options = {
                title: i18n('importChooserTitle'),
                buttonLabel: i18n('importButton'),
            };
            return getDirectory(options);
        },
        importFromDirectory: function(directory) {
            var idb;
            return openDatabase().then(function(idb_db) {
                idb = idb_db;
                return importDatabase(idb_db, directory);
            }).then(function() {
                return directory;
            }).then(function(path) {
                console.log('done restoring from backup!');
                return path;
            }, function(error) {
                console.log(
                  'the import went wrong:',
                  error && error.stack ? error.stack : error
                );
                return Promise.reject(error);
            });
        }
    };

}());
