(function () {
  'use strict';

  const exports = window.deferred_to_promise = {};

  exports.deferredToPromise = deferred =>
    // eslint-disable-next-line more/no-then
    new Promise((resolve, reject) => deferred.then(resolve, reject));
})();