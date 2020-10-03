/* eslint-env node */

/* eslint strict: ['error', 'never'] */

(function () {
  'use strict';

  const _ = window.lodash;

  const debuglogs = window.debuglogs;
  const Privacy = window.privacy;

  // Default Bunyan levels: https://github.com/trentm/node-bunyan#levels
  // To make it easier to visually scan logs, we make all levels the same length
  const BLANK_LEVEL = '     ';
  const LEVELS = {
    60: 'fatal',
    50: 'error',
    40: 'warn ',
    30: 'info ',
    20: 'debug',
    10: 'trace',
  };

  // Backwards-compatible logging, simple strings and no level (defaulted to INFO)
  function now() {
    const date = new Date();
    return date.toJSON();
  }

  function log() {
    const args = Array.prototype.slice.call(arguments, 0);

    const consoleArgs = ['INFO ', now()].concat(args);
    console._log.apply(console, consoleArgs);

    // To avoid [Object object] in our log since console.log handles non-strings smoothly
    const str = args.map(item => {
      if (typeof item !== 'string') {
        try {
          return JSON.stringify(item);
        } catch (error) {
          return item;
        }
      }

      return item;
    });

    const logText = Privacy.redactAll(str.join(' '));
    ipc.send('log-info', logText);
  }

  if (window.console) {
    console._log = console.log;
    console.log = log;
  }

  // The mechanics of preparing a log for publish

  function getHeader() {
    let header = window.navigator.userAgent;

    header += ` uwp/${window.getUWPVersion()}`;
    header += ` env/${window.getEnvironment()}`;

    return header;
  }

  function getLevel(level) {
    const text = LEVELS[level];
    if (!text) {
      return BLANK_LEVEL;
    }

    return text.toUpperCase();
  }

  function formatLine(entry) {
    return `${getLevel(entry.level)} ${entry.time} ${entry.msg}`;
  }

  function format(entries) {
    return Privacy.redactAll(entries.map(formatLine).join('\n'));
  }

  function fetch() {
    return new Promise(resolve => {
      ipc.send('fetch-log');

      ipc.on('fetched-log', (event, text) => {
        const result = `${getHeader()}\n${format(text)}`;
        resolve(result);
      });
    });
  }

  const publish = debuglogs.upload;

  // A modern logging interface for the browser

  // We create our own stream because we don't want to output JSON to the devtools console.
  //   Anyway, the default process.stdout stream goes to the command-line, not the devtools.
  const logger = {
    write: entry => console._log(formatLine(JSON.parse(entry))),
    add: (level, msg) => logger.write(JSON.stringify({ level: level, time: new Date(), msg: msg })),
    fatal: msg => logger.write(JSON.stringify({})),
    error: msg => logger.add(50, msg),
    warn: msg => logger.add(40, msg),
    info: msg => logger.add(30, msg),
    debug: msg => logger.add(20, msg),
    trace: msg => logger.add(10, msg),
  }

  // The Bunyan API: https://github.com/trentm/node-bunyan#log-method-api
  function logAtLevel() {
    const level = arguments[0];
    const args = Array.prototype.slice.call(arguments, 1);

    const ipcArgs = [`log-${level}`].concat(args);
    ipc.send.apply(ipc, ipcArgs);

    logger[level].apply(logger, args);
  }

  window.log = {
    fatal: _.partial(logAtLevel, 'fatal'),
    error: _.partial(logAtLevel, 'error'),
    warn: _.partial(logAtLevel, 'warn'),
    info: _.partial(logAtLevel, 'info'),
    debug: _.partial(logAtLevel, 'debug'),
    trace: _.partial(logAtLevel, 'trace'),
    fetch,
    publish,
  };

  window.onerror = (message, script, line, col, error) => {
    const errorInfo = error && error.stack ? error.stack : JSON.stringify(error);
    window.log.error(`Top-level unhandled error: ${errorInfo}`);
  };

  window.addEventListener('unhandledrejection', rejectionEvent => {
    window.log.error(
      `Top-level unhandled promise rejection: ${rejectionEvent.reason}`
    );
  });
})();