(function () {
    'use strict';

    const { ipcRenderer } = window.electron;

    /* eslint-env node */

    window.logs = { 
        deleteAll: deleteAll,
    };

    function deleteAll() {
        return new Promise((resolve, reject) => {
            ipcRenderer.once('delete-all-logs-complete', resolve);

            setTimeout(() => {
                reject(new Error('Request to delete all logs timed out'));
            }, 5000);

            ipcRenderer.send('delete-all-logs');
        });
    }
})();