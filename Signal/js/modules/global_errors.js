(function () {
    const addUnhandledErrorHandler = options => window.onerror = options.logger(error);
    
    const Errors = window.types.errors;


    //      addHandler :: Unit -> Unit
    window.global_errors = {
        addHandler: () => {
            addUnhandledErrorHandler({
                logger: (error) => {
                    console.error(
                      'Uncaught error or unhandled promise rejection:',
                      Errors.toLogFormat(error)
                    );
                },
                showDialog: false,
            });
        }
    }
})();