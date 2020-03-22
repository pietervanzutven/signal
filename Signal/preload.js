'use strict';

console.log('preload');

window.PROTO_ROOT = '/protos';

window.config.localeMessages = ipc.sendSync('locale-data');

window.setBadgeCount = function (count) {
    ipc.send('set-badge-count', count);
};
window.drawAttention = function () {
    console.log('draw attention');
    ipc.send('draw-attention');
}
window.showWindow = function () {
    console.log('show window');
    ipc.send('show-window');
};
window.restart = function() {
    console.log('restart');
    ipc.send('restart');    
};
ipc.on('debug-log', function () {
    Whisper.events.trigger('showDebugLog');
});

var Signal = {};