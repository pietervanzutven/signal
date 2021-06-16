require(exports => {
    "use strict";
    // Copyright 2017-2021 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    }));
    var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    });
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetch = exports.fetchLog = exports.eliminateOldEntries = exports.eliminateOutOfDateFiles = exports.isLineAfterDate = exports.initialize = void 0;
    // NOTE: Temporarily allow `then` until we convert the entire file to `async` / `await`:
    /* eslint-disable more/no-then */
    /* eslint-disable no-console */
    const path = __importStar(require("path"));
    const fs = __importStar(require("fs"));
    const electron_1 = require("electron");
    const bunyan = __importStar(require("bunyan"));
    const mkdirp = __importStar(require("mkdirp"));
    const _ = __importStar(require("lodash"));
    const firstline_1 = __importDefault(require("firstline"));
    const read_last_lines_1 = require("read-last-lines");
    const rimraf_1 = __importDefault(require("rimraf"));
    const shared_1 = require("./shared");
    let globalLogger;
    const isRunningFromConsole = Boolean(process.stdout.isTTY);
    async function initialize() {
        var _a;
        if (globalLogger) {
            throw new Error('Already called initialize!');
        }
        const basePath = electron_1.app.getPath('userData');
        const logPath = path.join(basePath, 'logs');
        mkdirp.sync(logPath);
        try {
            await cleanupLogs(logPath);
        }
        catch (error) {
            const errorString = `Failed to clean logs; deleting all. Error: ${error.stack}`;
            console.error(errorString);
            await deleteAllLogs(logPath);
            mkdirp.sync(logPath);
            // If we want this log entry to persist on disk, we need to wait until we've
            //   set up our logging infrastructure.
            setTimeout(() => {
                console.error(errorString);
            }, 500);
        }
        const logFile = path.join(logPath, 'log.log');
        const loggerOptions = {
            name: 'log',
            streams: [
                {
                    type: 'rotating-file',
                    path: logFile,
                    period: '1d',
                    count: 3,
                },
            ],
        };
        if (isRunningFromConsole) {
            (_a = loggerOptions.streams) === null || _a === void 0 ? void 0 : _a.push({
                level: 'debug',
                stream: process.stdout,
            });
        }
        const logger = bunyan.createLogger(loggerOptions);
        electron_1.ipcMain.on('batch-log', (_first, batch) => {
            if (!Array.isArray(batch)) {
                logger.error('batch-log IPC event was called with a non-array; dropping logs');
                return;
            }
            batch.forEach(item => {
                if (shared_1.isLogEntry(item)) {
                    const levelString = shared_1.getLogLevelString(item.level);
                    logger[levelString]({
                        time: item.time,
                    }, item.msg);
                }
                else {
                    logger.error('batch-log IPC event was called with an invalid log entry; dropping entry');
                }
            });
        });
        electron_1.ipcMain.on('fetch-log', event => {
            fetch(logPath).then(data => {
                event.sender.send('fetched-log', data);
            }, error => {
                logger.error(`Problem loading log from disk: ${error.stack}`);
            });
        });
        electron_1.ipcMain.on('delete-all-logs', async (event) => {
            try {
                await deleteAllLogs(logPath);
            }
            catch (error) {
                logger.error(`Problem deleting all logs: ${error.stack}`);
            }
            event.sender.send('delete-all-logs-complete');
        });
        globalLogger = logger;
        return logger;
    }
    exports.initialize = initialize;
    async function deleteAllLogs(logPath) {
        return new Promise((resolve, reject) => {
            rimraf_1.default(logPath, {
                disableGlob: true,
            }, error => {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    }
    async function cleanupLogs(logPath) {
        const now = new Date();
        const earliestDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3));
        try {
            const remaining = await eliminateOutOfDateFiles(logPath, earliestDate);
            const files = _.filter(remaining, file => !file.start && file.end);
            if (!files.length) {
                return;
            }
            await eliminateOldEntries(files, earliestDate);
        }
        catch (error) {
            console.error('Error cleaning logs; deleting and starting over from scratch.', error.stack);
            // delete and re-create the log directory
            await deleteAllLogs(logPath);
            mkdirp.sync(logPath);
        }
    }
    // Exported for testing only.
    function isLineAfterDate(line, date) {
        if (!line) {
            return false;
        }
        try {
            const data = JSON.parse(line);
            return new Date(data.time).getTime() > date.getTime();
        }
        catch (e) {
            console.log('error parsing log line', e.stack, line);
            return false;
        }
    }
    exports.isLineAfterDate = isLineAfterDate;
    // Exported for testing only.
    function eliminateOutOfDateFiles(logPath, date) {
        const files = fs.readdirSync(logPath);
        const paths = files.map(file => path.join(logPath, file));
        return Promise.all(_.map(paths, target => Promise.all([firstline_1.default(target), read_last_lines_1.read(target, 2)]).then(results => {
            const start = results[0];
            const end = results[1].split('\n');
            const file = {
                path: target,
                start: isLineAfterDate(start, date),
                end: isLineAfterDate(end[end.length - 1], date) ||
                    isLineAfterDate(end[end.length - 2], date),
            };
            if (!file.start && !file.end) {
                fs.unlinkSync(file.path);
            }
            return file;
        })));
    }
    exports.eliminateOutOfDateFiles = eliminateOutOfDateFiles;
    // Exported for testing only.
    async function eliminateOldEntries(files, date) {
        await Promise.all(_.map(files, file => fetchLog(file.path).then(lines => {
            const recent = _.filter(lines, line => new Date(line.time) >= date);
            const text = _.map(recent, line => JSON.stringify(line)).join('\n');
            return fs.writeFileSync(file.path, `${text}\n`);
        })));
    }
    exports.eliminateOldEntries = eliminateOldEntries;
    // Exported for testing only.
    function fetchLog(logFile) {
        return new Promise((resolve, reject) => {
            fs.readFile(logFile, { encoding: 'utf8' }, (err, text) => {
                if (err) {
                    return reject(err);
                }
                const lines = _.compact(text.split('\n'));
                const data = _.compact(lines.map(line => {
                    try {
                        const result = _.pick(JSON.parse(line), ['level', 'time', 'msg']);
                        return shared_1.isLogEntry(result) ? result : null;
                    }
                    catch (e) {
                        return null;
                    }
                }));
                return resolve(data);
            });
        });
    }
    exports.fetchLog = fetchLog;
    // Exported for testing only.
    function fetch(logPath) {
        const files = fs.readdirSync(logPath);
        const paths = files.map(file => path.join(logPath, file));
        // creating a manual log entry for the final log result
        const fileListEntry = {
            level: shared_1.LogLevel.Info,
            time: new Date().toISOString(),
            msg: `Loaded this list of log files from logPath: ${files.join(', ')}`,
        };
        return Promise.all(paths.map(fetchLog)).then(results => {
            const data = _.flatten(results);
            data.push(fileListEntry);
            return _.sortBy(data, logEntry => logEntry.time);
        });
    }
    exports.fetch = fetch;
    function logAtLevel(level, ...args) {
        if (globalLogger) {
            const levelString = shared_1.getLogLevelString(level);
            globalLogger[levelString](shared_1.cleanArgs(args));
        }
        else if (isRunningFromConsole) {
            console._log(...args);
        }
    }
    // This blows up using mocha --watch, so we ensure it is run just once
    if (!console._log) {
        console._log = console.log;
        console.log = _.partial(logAtLevel, shared_1.LogLevel.Info);
        console._error = console.error;
        console.error = _.partial(logAtLevel, shared_1.LogLevel.Error);
        console._warn = console.warn;
        console.warn = _.partial(logAtLevel, shared_1.LogLevel.Warn);
    }
});