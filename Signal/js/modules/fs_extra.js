﻿'use strict';

(function () {
    const storage = Windows.Storage;
    const fileIO = storage.FileIO;
    const localFolder = storage.ApplicationData.current.localFolder;

    window.fs_extra = {
        ensureDir: async (directoryPath) => {
            var uri = new Windows.Foundation.Uri(directoryPath);
            let folder = localFolder;
            if (uri.path.length > 1) {
                const pathParts = uri.path.split('/');
                for (let i = 1; i < pathParts.length; i++) {
                    folder = await folder.createFolderAsync(pathParts[i], Windows.Storage.CreationCollisionOption.openIfExists);
                }
            }
            return folder;
        },
        ensureFile: async (filePath) => {
            const pathParts = filePath.split('/');
            const fileName = pathParts.pop();
            const folder = await window.fs_extra.ensureDir(pathParts.join('/'));
            return folder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.openIfExists);
        },
        readFile: async (filePath) => {
            const file = await window.fs_extra.ensureFile(filePath);
            const buffer = await fileIO.readBufferAsync(file);
            return Windows.Security.Cryptography.CryptographicBuffer.copyToByteArray(buffer);
        },
        writeFile: async (filePath, buffer) => {
            const data = new Uint8Array(buffer.data);
            const file = await window.fs_extra.ensureFile(filePath);
            fileIO.writeBytesAsync(file, data);
        },
        remove: async (filePath) => {
            const file = await window.fs_extra.ensureFile(filePath);
            file.deleteAsync();
        },
    }
})();