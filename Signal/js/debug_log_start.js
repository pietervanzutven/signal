$(document).on('keyup', function(e) {
  if (e.keyCode === 27) {
    window.closeDebugLog();
  }
});

const $body = $(document.body);
$body.addClass(window.theme);

window.view = new Whisper.DebugLogView();
window.view.$el.appendTo($body);
