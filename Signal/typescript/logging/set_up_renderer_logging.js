require(exports => {
    "use strict";
    // Copyright 2017-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-env node */
    /* eslint-disable no-console */
    const electron_1 = require("electron");
    const lodash_1 = __importDefault(require("lodash"));
    const bunyan_1 = require("bunyan");
    const debuglogs_1 = require("./debuglogs");
    const privacy_1 = require("../../js/modules/privacy");
    const batcher_1 = require("../util/batcher");
    const shared_1 = require("./shared");
    const reallyJsonStringify_1 = require("../util/reallyJsonStringify");
    // To make it easier to visually scan logs, we make all levels the same length
    const levelMaxLength = Object.keys(bunyan_1.levelFromName).reduce((maxLength, level) => Math.max(maxLength, level.length), 0);
    // Backwards-compatible logging, simple strings and no level (defaulted to INFO)
    function now() {
        const date = new Date();
        return date.toJSON();
    }
    function log(...args) {
        logAtLevel(shared_1.LogLevel.Info, ...args);
    }
    if (window.console) {
        console._log = console.log;
        console.log = log;
    }
    // The mechanics of preparing a log for publish
    function getHeader() {
        let header = window.navigator.userAgent;
        header += ` node/${window.getNodeVersion()}`;
        header += ` env/${window.getEnvironment()}`;
        return header;
    }
    const getLevel = lodash_1.default.memoize((level) => {
        const text = shared_1.getLogLevelString(level);
        return text.toUpperCase().padEnd(levelMaxLength, ' ');
    });
    function formatLine(mightBeEntry) {
        const entry = shared_1.isLogEntry(mightBeEntry)
            ? mightBeEntry
            : {
                level: shared_1.LogLevel.Error,
                msg: `Invalid IPC data when fetching logs. Here's what we could recover: ${reallyJsonStringify_1.reallyJsonStringify(mightBeEntry)}`,
                time: new Date().toISOString(),
            };
        return `${getLevel(entry.level)} ${entry.time} ${entry.msg}`;
    }
    function fetch() {
        return new Promise(resolve => {
            electron_1.ipcRenderer.send('fetch-log');
            electron_1.ipcRenderer.on('fetched-log', (_event, logEntries) => {
                let body;
                if (Array.isArray(logEntries)) {
                    body = logEntries.map(formatLine).join('\n');
                }
                else {
                    const entry = {
                        level: shared_1.LogLevel.Error,
                        msg: 'Invalid IPC data when fetching logs; dropping all logs',
                        time: new Date().toISOString(),
                    };
                    body = formatLine(entry);
                }
                const result = `${getHeader()}\n${privacy_1.redactAll(body)}`;
                resolve(result);
            });
        });
    }
    const publish = debuglogs_1.uploadDebugLogs;
    // A modern logging interface for the browser
    const env = window.getEnvironment();
    const IS_PRODUCTION = env === 'production';
    const ipcBatcher = batcher_1.createBatcher({
        wait: 500,
        maxSize: 500,
        processBatch: (items) => {
            electron_1.ipcRenderer.send('batch-log', items);
        },
    });
    // The Bunyan API: https://github.com/trentm/node-bunyan#log-method-api
    function logAtLevel(level, ...args) {
        if (!IS_PRODUCTION) {
            const prefix = shared_1.getLogLevelString(level)
                .toUpperCase()
                .padEnd(levelMaxLength, ' ');
            console._log(prefix, now(), ...args);
        }
        ipcBatcher.add({
            level,
            msg: shared_1.cleanArgs(args),
            time: new Date().toISOString(),
        });
    }
    window.log = {
        fatal: lodash_1.default.partial(logAtLevel, shared_1.LogLevel.Fatal),
        error: lodash_1.default.partial(logAtLevel, shared_1.LogLevel.Error),
        warn: lodash_1.default.partial(logAtLevel, shared_1.LogLevel.Warn),
        info: lodash_1.default.partial(logAtLevel, shared_1.LogLevel.Info),
        debug: lodash_1.default.partial(logAtLevel, shared_1.LogLevel.Debug),
        trace: lodash_1.default.partial(logAtLevel, shared_1.LogLevel.Trace),
        fetch,
        publish,
    };
    window.onerror = (_message, _script, _line, _col, error) => {
        const errorInfo = error && error.stack ? error.stack : JSON.stringify(error);
        window.log.error(`Top-level unhandled error: ${errorInfo}`);
    };
    window.addEventListener('unhandledrejection', rejectionEvent => {
        const error = rejectionEvent.reason;
        const errorString = error && error.stack ? error.stack : JSON.stringify(error);
        window.log.error(`Top-level unhandled promise rejection: ${errorString}`);
    });
});