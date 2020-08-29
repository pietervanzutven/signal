(function () {
  'use strict';
  
  const exports = window.types = window.types || {};

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