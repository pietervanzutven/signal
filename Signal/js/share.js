'use strict';

Windows.UI.WebUI.WebUIApplication.addEventListener('activated', event => {
    event.detail[0].shareOperation.data.getStorageItemsAsync().then(files => {
        var fileToken = Windows.ApplicationModel.DataTransfer.SharedStorageAccessManager.addFile(files[0]);
        var uri = Windows.Foundation.Uri('signal:?file=' + fileToken);   
        Windows.System.Launcher.launchUriAsync(uri).then(() => event.detail[0].shareOperation.reportCompleted());
    });
});