/* global $: false */
/* global Whisper: false */

$(document).on('keyup', e => {
  'use strict';

  if (e.keyCode === 27) {
    window.closeDebugLog();
  }
});

const $body = $(document.body);
$body.addClass(`${window.theme}-theme`);

window.view = new Whisper.DebugLogView();
window.view.$el.appendTo($body);
