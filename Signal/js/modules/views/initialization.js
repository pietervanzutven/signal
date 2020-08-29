/* eslint-env browser */

/* global i18n: false */

(function () {
  'use strict';

  window.views = window.views || {};

  const OPTIMIZATION_MESSAGE_DISPLAY_THRESHOLD = 1000; // milliseconds

  const setMessage = () => {
    const message = document.querySelector('.app-loading-screen .message');
    if (!message) {
      return () => { };
    }
    message.innerText = i18n('loading');

    const optimizingMessageTimeoutId = setTimeout(() => {
      const innerMessage = document.querySelector('.app-loading-screen .message');
      if (!innerMessage) {
        return;
      }
      innerMessage.innerText = i18n('optimizingApplication');
    }, OPTIMIZATION_MESSAGE_DISPLAY_THRESHOLD);

    return () => {
      clearTimeout(optimizingMessageTimeoutId);
    };
  };

  window.views.initialization = {
    setMessage,
  };
})();