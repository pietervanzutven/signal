(function () {
    const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];

    let logger;


    function dropFirst(args) {
        return Array.prototype.slice.call(args, 1);
    }

    function initialize() {
        if (logger) {
            throw new Error('Already called initialize!');
        }

        logger = {
            log: [],
            add: (level, msg) => logger.log.push({ level: level, time: new Date().toJSON(), msg: msg }),
            fatal: msg => logger.add(60, msg),
            error: msg => logger.add(50, msg),
            warn: msg => logger.add(40, msg),
            info: msg => logger.add(30, msg),
            debug: msg => logger.add(20, msg),
            trace: msg => logger.add(10, msg),
        };

        LEVELS.forEach(function (level) {
            ipc.on('log-' + level, function () {
                // first parameter is the event, rest are provided arguments
                var args = dropFirst(arguments);
                logger[level].apply(logger, args);
            });
        });

        ipc.on('fetch-log', function (event) {
            event.returnValue = fetch();
        });
    }

    function getLogger() {
        if (!logger) {
            throw new Error('Logger hasn\'t been initialized yet!');
        }

        return logger;
    }

    function fetch() {
        const data = logger.log;
        return _.sortBy(data, 'time');
    }


    window.logging = {
        initialize: initialize,
        getLogger: getLogger
    };
})()