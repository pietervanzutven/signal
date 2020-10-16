/* global $, Whisper */

$(document).on('keyup', e => {
  'use strict';

  if (e.keyCode === 27) {
    window.closeSettings();
  }
});

const $body = $(document.body);
$body.addClass(`${window.theme}-theme`);

// eslint-disable-next-line strict
const getInitialData = async () => ({
  deviceName: await window.getDeviceName(),

  themeSetting: await window.getThemeSetting(),
  hideMenuBar: await window.getHideMenuBar(),

  notificationSetting: await window.getNotificationSetting(),
  audioNotification: await window.getAudioNotification(),

  spellCheck: await window.getSpellCheck(),

  mediaPermissions: await window.getMediaPermissions(),

  isPrimary: await window.isPrimary(),
  lastSyncTime: await window.getLastSyncTime(),
});

window.initialRequest = getInitialData();

// eslint-disable-next-line more/no-then
window.initialRequest.then(data => {
  'use strict';

  window.initialData = data;
  window.view = new Whisper.SettingsView();
  window.view.$el.appendTo($body);
});
