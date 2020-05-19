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
window.setAutoHideMenuBar = function (autoHide) {
    ipc.send('set-auto-hide-menu-bar', autoHide);
};
window.setMenuBarVisibility = function (visibility) {
    ipc.send('set-menu-bar-visibility', visibility);
};
window.restart = function() {
    console.log('restart');
    ipc.send('restart');    
};
window.closeAbout = function () {
    ipc.send('close-about');
};
window.updateTrayIcon = function (unreadCount) {
    ipc.send('update-tray-icon', unreadCount);
};

ipc.on('debug-log', function () {
    Whisper.events.trigger('showDebugLog');
});

var Signal = {};