(function () {
    const storage = Windows.Storage;
    const fileIO = storage.FileIO;
    const localFolder = storage.ApplicationData.current.localFolder;

    window.fs_extra = {
        ensureDir: async (directoryPath) => {
            await localFolder.createFolderAsync(directoryPath, Windows.Storage.CreationCollisionOption.openIfExists);
        },
        ensureFile: async (filePath) => {
            return localFolder.createFileAsync(filePath, Windows.Storage.CreationCollisionOption.openIfExists);
        },
        readFile: async (filePath) => {
            const file = await localFolder.getFileAsync(filePath);
            const buffer = await fileIO.readBufferAsync(file);
            return Windows.Security.Cryptography.CryptographicBuffer.copyToByteArray(buffer);
        },
        writeFile: async (filePath, buffer) => {
            const data = new Uint8Array(buffer);
            const file = await localFolder.getFileAsync(filePath);
            await fileIO.writeBytesAsync(file, data);
        },
        remove: async (filePath) => {
            const file = await localFolder.getFileAsync(filePath);
            await file.deleteAsync();
        },
    }
})();