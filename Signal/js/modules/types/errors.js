(function () {
    window.types = window.types || {};

    //      toLogFormat :: Error -> String
    window.types.errors = {
        toLogFormat: (error) => {
            if (!error) {
                return error;
            }

            if (error && error.stack) {
                return error.stack;
            }

            return error.toString();
        }
    };
})();