require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable no-console */
    const redux_1 = require("redux");
    const redux_promise_middleware_1 = __importDefault(require("redux-promise-middleware"));
    const redux_thunk_1 = __importDefault(require("redux-thunk"));
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
        predicate: (_getState, action) => {
            if (action.type === 'network/CHECK_NETWORK_STATUS') {
                return false;
            }
            return true;
        },
    });
    const middlewareList = [
        redux_promise_middleware_1.default,
        redux_thunk_1.default,
        ...(env === 'production' ? [] : [logger]),
    ];
    const enhancer = redux_1.applyMiddleware(...middlewareList);
    exports.createStore = (initialState) => redux_1.createStore(reducer_1.reducer, initialState, enhancer);
});