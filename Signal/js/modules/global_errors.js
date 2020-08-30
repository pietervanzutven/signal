(function () {
  'use strict';

  const exports = window.global_errors = {};

  const addUnhandledErrorHandler = () => { };

  const Errors = window.types.errors;

  //      addHandler :: Unit -> Unit
  exports.addHandler = () => {
    addUnhandledErrorHandler({
      logger: error => {
        console.error(
          'Uncaught error or unhandled promise rejection:',
          Errors.toLogFormat(error)
        );
      },
      showDialog: false,
    });
  };
})();