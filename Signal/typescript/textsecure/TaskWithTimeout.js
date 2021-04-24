(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.TaskWithTimeout = {};

    // tslint:disable no-default-export
    Object.defineProperty(exports, "__esModule", { value: true });
    function createTaskWithTimeout(task, id, options = {}) {
        const timeout = options.timeout || 1000 * 60 * 2; // two minutes
        const errorForStack = new Error('for stack');
        return async () => new Promise((resolve, reject) => {
            let complete = false;
            let timer = setTimeout(() => {
                if (!complete) {
                    const message = `${id ||
                        ''} task did not complete in time. Calling stack: ${errorForStack.stack}`;
                    window.log.error(message);
                    reject(new Error(message));
                    return;
                }
                return null;
            }, timeout);
            const clearTimer = () => {
                try {
                    const localTimer = timer;
                    if (localTimer) {
                        timer = null;
                        clearTimeout(localTimer);
                    }
                }
                catch (error) {
                    window.log.error(id || '', 'task ran into problem canceling timer. Calling stack:', errorForStack.stack);
                }
            };
            const success = (result) => {
                clearTimer();
                complete = true;
                resolve(result);
                return;
            };
            const failure = (error) => {
                clearTimer();
                complete = true;
                reject(error);
                return;
            };
            let promise;
            try {
                promise = task();
            }
            catch (error) {
                clearTimer();
                throw error;
            }
            if (!promise || !promise.then) {
                clearTimer();
                complete = true;
                resolve(promise);
                return;
            }
            return promise.then(success, failure);
        });
    }
    exports.default = createTaskWithTimeout;
})();