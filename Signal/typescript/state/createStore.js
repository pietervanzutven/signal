require(exports => {
    "use strict";
    /* eslint-disable no-console */
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const redux_1 = require("redux");
    const redux_promise_middleware_1 = __importDefault(require("redux-promise-middleware"));
    const redux_logger_1 = require("redux-logger");
    const reducer_1 = require("./reducer");
    const env = window.getEnvironment();
    // So Redux logging doesn't go to disk, and so we can get colors/styles
    const directConsole = {
        log: console._log,
        groupCollapsed: console.groupCollapsed,
        group: console.group,
        groupEnd: console.groupEnd,
        warn: console.warn,
        error: console.error,
    };
    const logger = redux_logger_1.createLogger({
        logger: directConsole,
    });
    // Exclude logger if we're in production mode
    const middlewareList = env === 'production' ? [redux_promise_middleware_1.default] : [redux_promise_middleware_1.default, logger];
    const enhancer = redux_1.applyMiddleware(...middlewareList);
    exports.createStore = (initialState) => redux_1.createStore(reducer_1.reducer, initialState, enhancer);
});