require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const zkgroup_1 = require("zkgroup");
    const zkgroup_2 = require("../util/zkgroup");
    const sleep_1 = require("../util/sleep");
    exports.GROUP_CREDENTIALS_KEY = 'groupCredentials';
    const SECOND = 1000;
    const MINUTE = 60 * SECOND;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    function getTodayInEpoch() {
        return Math.floor(Date.now() / DAY);
    }
    let started = false;
    async function initializeGroupCredentialFetcher() {
        if (started) {
            return;
        }
        window.log.info('initializeGroupCredentialFetcher: starting...');
        started = true;
        // Because we fetch eight days of credentials at a time, we really only need to run
        //   this about once a week. But there's no problem running it more often; it will do
        //   nothing if no new credentials are needed, and will only request needed credentials.
        await runWithRetry(maybeFetchNewCredentials, { scheduleAnother: 4 * HOUR });
    }
    exports.initializeGroupCredentialFetcher = initializeGroupCredentialFetcher;
    const BACKOFF = {
        0: SECOND,
        1: 5 * SECOND,
        2: 30 * SECOND,
        3: 2 * MINUTE,
        max: 5 * MINUTE,
    };
    async function runWithRetry(fn, options = {}) {
        let count = 0;
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                count += 1;
                // eslint-disable-next-line no-await-in-loop
                await fn();
                return;
            }
            catch (error) {
                const wait = BACKOFF[count] || BACKOFF.max;
                window.log.info(`runWithRetry: ${fn.name} failed. Waiting ${wait}ms for retry. Error: ${error.stack}`);
                // eslint-disable-next-line no-await-in-loop
                await sleep_1.sleep(wait);
            }
        }
        // It's important to schedule our next run here instead of the level above; otherwise we
        //   could end up with multiple endlessly-retrying runs.
        const duration = options.scheduleAnother;
        if (duration) {
            window.log.info(`runWithRetry: scheduling another run with a setTimeout duration of ${duration}ms`);
            setTimeout(async () => runWithRetry(fn, options), duration);
        }
    }
    exports.runWithRetry = runWithRetry;
    // In cases where we are at a day boundary, we might need to use tomorrow in a retry
    function getCredentialsForToday(data) {
        if (!data) {
            throw new Error('getCredentialsForToday: No credentials fetched!');
        }
        const todayInEpoch = getTodayInEpoch();
        const todayIndex = data.findIndex((item) => item.redemptionTime === todayInEpoch);
        if (todayIndex < 0) {
            throw new Error('getCredentialsForToday: Cannot find credentials for today');
        }
        return {
            today: data[todayIndex],
            tomorrow: data[todayIndex + 1],
        };
    }
    exports.getCredentialsForToday = getCredentialsForToday;
    async function maybeFetchNewCredentials() {
        const uuid = window.textsecure.storage.user.getUuid();
        if (!uuid) {
            window.log.info('maybeFetchCredentials: no UUID, returning early');
            return;
        }
        const previous = window.storage.get(exports.GROUP_CREDENTIALS_KEY);
        const requestDates = getDatesForRequest(previous);
        if (!requestDates) {
            window.log.info('maybeFetchCredentials: no new credentials needed');
            return;
        }
        const accountManager = window.getAccountManager();
        if (!accountManager) {
            window.log.info('maybeFetchCredentials: unable to get AccountManager');
            return;
        }
        const { startDay, endDay } = requestDates;
        window.log.info(`maybeFetchCredentials: fetching credentials for ${startDay} through ${endDay}`);
        const serverPublicParamsBase64 = window.getServerPublicParams();
        const clientZKAuthOperations = zkgroup_2.getClientZkAuthOperations(serverPublicParamsBase64);
        const newCredentials = sortCredentials(await accountManager.getGroupCredentials(startDay, endDay)).map((item) => {
            const authCredential = clientZKAuthOperations.receiveAuthCredential(uuid, item.redemptionTime, new zkgroup_1.AuthCredentialResponse(zkgroup_2.base64ToCompatArray(item.credential)));
            const credential = zkgroup_2.compatArrayToBase64(authCredential.serialize());
            return {
                redemptionTime: item.redemptionTime,
                credential,
            };
        });
        const todayInEpoch = getTodayInEpoch();
        const previousCleaned = previous
            ? previous.filter((item) => item.redemptionTime >= todayInEpoch)
            : [];
        const finalCredentials = [...previousCleaned, ...newCredentials];
        window.log.info('maybeFetchCredentials: Saving new credentials...');
        // Note: we don't wait for this to finish
        window.storage.put(exports.GROUP_CREDENTIALS_KEY, finalCredentials);
        window.log.info('maybeFetchCredentials: Save complete.');
    }
    exports.maybeFetchNewCredentials = maybeFetchNewCredentials;
    function getDatesForRequest(data) {
        const todayInEpoch = getTodayInEpoch();
        const oneWeekOut = todayInEpoch + 7;
        const lastCredential = lodash_1.last(data);
        if (!lastCredential || lastCredential.redemptionTime < todayInEpoch) {
            return {
                startDay: todayInEpoch,
                endDay: oneWeekOut,
            };
        }
        if (lastCredential.redemptionTime >= oneWeekOut) {
            return undefined;
        }
        return {
            startDay: lastCredential.redemptionTime + 1,
            endDay: oneWeekOut,
        };
    }
    exports.getDatesForRequest = getDatesForRequest;
    function sortCredentials(data) {
        return lodash_1.sortBy(data, (item) => item.redemptionTime);
    }
    exports.sortCredentials = sortCredentials;
});