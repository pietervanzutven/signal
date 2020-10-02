
(async function () {
    'use strict';
    
    const storage = Windows.Storage;
    const fileIO = storage.FileIO;
    const creationCollisionOption = storage.CreationCollisionOption;
    const localFolder = storage.ApplicationData.current.localFolder;
    
    const localesFolder = await localFolder.createFolderAsync('_locales', creationCollisionOption.openIfExists);
    const localesFolders = await localesFolder.getFoldersAsync();
    const localesFiles = {};
    const messages = {};
    for (let i=0; i<localesFolders.length; i++) {
        const name = localesFolders[i].name;
        localesFiles[name] = await localesFolders[i].getFileAsync('messages.json');
        const text = await fileIO.readTextAsync(localesFiles[name]);
        messages[name] = JSON.parse(text);
    }

    const localesNewFolder = await localFolder.createFolderAsync('_locales_new', creationCollisionOption.openIfExists);
    const localesNewFolders = await localesNewFolder.getFoldersAsync();
    for (let i=0; i<localesNewFolders.length; i++) {
        const name = localesNewFolders[i].name;
        const file = await localesNewFolders[i].getFileAsync('messages.json');
        const text = await fileIO.readTextAsync(file);
        Object.assign(messages[name], JSON.parse(text));

        await fileIO.writeTextAsync(localesFiles[name], JSON.stringify(messages[name], null, '\t'));
    }

})();