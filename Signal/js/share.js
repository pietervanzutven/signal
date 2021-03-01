'use strict';

Windows.UI.WebUI.WebUIApplication.addEventListener('activated', event => {
    event.detail[0].shareOperation.data.getStorageItemsAsync().then(files => {
        var file = files[0];
        var type = file.contentType.split('/')[0];
        switch (type) {
            case 'image':
                preview.src = URL.createObjectURL(file);
                break;
            default:
                preview.src = '/images/file.svg';
                break;
        }

        var fileToken = Windows.ApplicationModel.DataTransfer.SharedStorageAccessManager.addFile(file);
        var uri = Windows.Foundation.Uri('signal:?file=' + fileToken);
        Windows.System.Launcher.launchUriAsync(uri).then(() => event.detail[0].shareOperation.reportCompleted());
    });
});