(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    const exports = window.ts.state.createStore = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const redux_1 = window.redux;
    const redux_promise_middleware_1 = __importDefault(window.redux_promise_middleware);
    const redux_logger_1 = window.redux_logger;
    const reducer_1 = window.ts.state.reducer;
    // @ts-ignore
    const env = window.getEnvironment();
    // So Redux logging doesn't go to disk, and so we can get colors/styles
    const directConsole = {
        // @ts-ignore
        log: console._log,
        groupCollapsed: console.groupCollapsed,
        group: console.group,
        groupEnd: console.groupEnd,
        warn: console.warn,
        // tslint:disable-next-line no-console
        error: console.error,
    };
    const logger = redux_logger_1.createLogger({
        logger: directConsole,
    });
    // Exclude logger if we're in production mode
    const middlewareList = env === 'production' ? [redux_promise_middleware_1.default] : [redux_promise_middleware_1.default, logger];
    const enhancer = redux_1.applyMiddleware.apply(null, middlewareList);
    exports.createStore = (initialState) => redux_1.createStore(reducer_1.reducer, initialState, enhancer);
})();