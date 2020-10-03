$(document).on('keyup', function(e) {
  if (e.keyCode === 27) {
    window.closeDebugLog();
  }
});

const $body = $(document.body);

window.view = new Whisper.DebugLogView();
window.view.$el.appendTo($body);
