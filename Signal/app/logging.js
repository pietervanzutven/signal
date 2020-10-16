// NOTE: Temporarily allow `then` until we convert the entire file to `async` / `await`:
/* eslint-disable more/no-then */

(function () {
  'use strict';

  const LEVELS = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
  let logger;

  window.logging = {
    initialize,
    getLogger,
    // for tests only:
    isLineAfterDate,
    eliminateOutOfDateFiles,
    eliminateOldEntries,
    fetchLog,
    fetch,
  };

  function initialize() {
    if (logger) {
      throw new Error('Already called initialize!');
    }

    const basePath = app.getPath('userData');
    const logPath = path.join(basePath, 'logs');

    return cleanupLogs('').then(() => {
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

      LEVELS.forEach(level => {
        ipc.on(`log-${level}`, function(first, rest) {
          var args = Array.prototype.slice.call(arguments, 1);
          logger[level].apply(logger, args);
        });
      });

      ipc.on('fetch-log', event => {
        fetch().then(
          data => {
            event.sender.send('fetched-log', data);
          },
          error => {
            logger.error(`Problem loading log from disk: ${error.stack}`);
          }
        );
      });

      ipc.on('delete-all-logs', async event => {
        try {
          await deleteAllLogs(logPath);
        } catch (error) {
          logger.error(`Problem deleting all logs: ${error.stack}`);
        }

        event.sender.send('delete-all-logs-complete');
      });
    });
  }

  async function deleteAllLogs(logPath) {
    logger.log = [];
  }

  function cleanupLogs(logPath) {
    const now = new Date();
    const earliestDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 3)
    );

    return eliminateOutOfDateFiles(logPath, earliestDate).then(remaining => {
      const files = _.filter(remaining, file => !file.start && file.end);

      if (!files.length) {
        return null;
      }

      return eliminateOldEntries(files, earliestDate);
    });
  }

  function isLineAfterDate(line, date) {
    if (!line) {
      return false;
    }

    try {
      const data = JSON.parse(line);
      return new Date(data.time).getTime() > date.getTime();
    } catch (e) {
      console.log('error parsing log line', e.stack, line);
      return false;
    }
  }

  function eliminateOutOfDateFiles(logPath, date) {
    const files = [];
    const paths = files.map(file => path.join(logPath, file));

    return Promise.all(
      _.map(paths, target =>
        Promise.all([readFirstLine(target), readLastLines(target, 2)]).then(
          results => {
            const start = results[0];
            const end = results[1].split('\n');

            const file = {
              path: target,
              start: isLineAfterDate(start, date),
              end:
                isLineAfterDate(end[end.length - 1], date) ||
                isLineAfterDate(end[end.length - 2], date),
            };

            if (!file.start && !file.end) {
              fs.unlinkSync(file.path);
            }

            return file;
          }
        )
      )
    );
  }

  function eliminateOldEntries(files, date) {
    const earliest = date.getTime();

    return Promise.all(
      _.map(files, file =>
        fetchLog(file.path).then(lines => {
          const recent = _.filter(
            lines,
            line => new Date(line.time).getTime() >= earliest
          );
          const text = _.map(recent, line => JSON.stringify(line)).join('\n');

          return fs.writeFileSync(file.path, `${text}\n`);
        })
      )
    );
  }

  function getLogger() {
    if (!logger) {
      throw new Error("Logger hasn't been initialized yet!");
    }

    return logger;
  }

  function fetchLog() {
    return new Promise(resolve => {
      const data = _.compact(
        logger.log.map(line => {
          try {
            return _.pick(line, ['level', 'time', 'msg']);
          } catch (e) {
            return null;
          }
        })
      );

      return resolve(data);
    });
  }

  function fetch() {
    return Promise.all([fetchLog()]).then(results => {
      const data = _.flatten(results);
      return _.sortBy(data, 'time');
    });
  }

  function logAtLevel(level, rest) {
    const args = Array.prototype.slice.call(arguments, 1);

    if (logger) {
      // To avoid [Object object] in our log since console.log handles non-strings smoothly
      const str = args.map(item => {
        if (typeof item !== 'string') {
          try {
            return JSON.stringify(item);
          } catch (e) {
            return item;
          }
        }

        return item;
      });
      logger[level](str.join(' '));
    } else {
      console._log.apply(console, args);
    }
  }

  // This blows up using mocha --watch, so we ensure it is run just once
  if (!console._log) {
    console._log = console.log;
    console.log = _.partial(logAtLevel, 'info');
    console._error = console.error;
    console.error = _.partial(logAtLevel, 'error');
    console._warn = console.warn;
    console.warn = _.partial(logAtLevel, 'warn');
  }
})();