(function () {
  'use strict';
  
  window.types = window.types || {};
  const exports = window.types.Errors = {};

  //      toLogFormat :: Error -> String
  exports.toLogFormat = error => {
    if (!error) {
      return error;
    }

    if (error && error.stack) {
      return error.stack;
    }

    return error.toString();
  };
})();