(function () {
  'use strict';

  window.app = window.app || {};

  const electron = window.electron;
  const Queue = window.p_queue;
  const sql = window.app.sql;
  const { remove: removeUserConfig } = window.app.user_config;
  const { remove: removeEphemeralConfig } = window.app.ephemeral_config;

  const { ipcMain } = electron;

  window.app.sql_channel = {
    initialize,
  };

  let initialized = false;

  const SQL_CHANNEL_KEY = 'sql-channel';
  const ERASE_SQL_KEY = 'erase-sql-key';

  const queue = new Queue({ concurrency: 1 });

  function initialize() {
    if (initialized) {
      throw new Error('sqlChannels: already initialized!');
    }
    initialized = true;

    ipcMain.on(SQL_CHANNEL_KEY, async (event, jobId, callName, ...args) => {
      try {
        const fn = sql[callName];
        if (!fn) {
          throw new Error(
            `sql channel: ${callName} is not an available function`
          );
        }

        // Note: we queue here to keep multi-query operations atomic. Without it, any
        //   multistage data operation (even within a BEGIN/COMMIT) can become interleaved,
        //   since all requests share one database connection.
        const result = await queue.add(() => fn(...args));
        event.sender.send(`${SQL_CHANNEL_KEY}-done`, jobId, null, result);
      } catch (error) {
        const errorForDisplay = error && error.stack ? error.stack : error;
        console.log(
          `sql channel error with call ${callName}: ${errorForDisplay}`
        );
        if (!event.sender.isDestroyed()) {
          event.sender.send(`${SQL_CHANNEL_KEY}-done`, jobId, errorForDisplay);
        }
      }
    });

    ipcMain.on(ERASE_SQL_KEY, async event => {
      try {
        removeUserConfig();
        removeEphemeralConfig();
        event.sender.send(`${ERASE_SQL_KEY}-done`);
      } catch (error) {
        const errorForDisplay = error && error.stack ? error.stack : error;
        console.log(`sql-erase error: ${errorForDisplay}`);
        event.sender.send(`${ERASE_SQL_KEY}-done`, error);
      }
    });
  }
})();