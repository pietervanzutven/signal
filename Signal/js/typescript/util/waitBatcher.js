function require_ts_util_waitBatcher() {
    "use strict";

    const exports = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const p_queue_1 = __importDefault(window.p_queue);
    // @ts-ignore
    window.waitBatchers = [];
    // @ts-ignore
    window.waitForAllWaitBatchers = async () => {
        // @ts-ignore
        await Promise.all(window.waitBatchers.map(item => item.onIdle()));
    };
    async function sleep(ms) {
        // tslint:disable-next-line:no-string-based-set-timeout
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    function createWaitBatcher(options) {
        let waitBatcher;
        let timeout;
        let items = [];
        const queue = new p_queue_1.default({ concurrency: 1 });
        function _kickBatchOff() {
            const itemsRef = items;
            items = [];
            // tslint:disable-next-line:no-floating-promises
            queue.add(async () => {
                try {
                    await options.processBatch(itemsRef.map(item => item.item));
                    itemsRef.forEach(item => {
                        item.resolve();
                    });
                }
                catch (error) {
                    itemsRef.forEach(item => {
                        item.reject(error);
                    });
                }
            });
        }
        function _makeExplodedPromise() {
            let resolve;
            let reject;
            // tslint:disable-next-line:promise-must-complete
            const promise = new Promise((resolveParam, rejectParam) => {
                resolve = resolveParam;
                reject = rejectParam;
            });
            // @ts-ignore
            return { promise, resolve, reject };
        }
        async function add(item) {
            const { promise, resolve, reject } = _makeExplodedPromise();
            items.push({
                resolve,
                reject,
                item,
            });
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            if (items.length >= options.maxSize) {
                _kickBatchOff();
            }
            else {
                timeout = setTimeout(() => {
                    timeout = null;
                    _kickBatchOff();
                }, options.wait);
            }
            await promise;
        }
        function anyPending() {
            return queue.size > 0 || queue.pending > 0 || items.length > 0;
        }
        async function onIdle() {
            while (anyPending()) {
                if (queue.size > 0 || queue.pending > 0) {
                    await queue.onIdle();
                }
                if (items.length > 0) {
                    await sleep(options.wait * 2);
                }
            }
        }
        function unregister() {
            // @ts-ignore
            window.waitBatchers = window.waitBatchers.filter((item) => item !== waitBatcher);
        }
        waitBatcher = {
            add,
            anyPending,
            onIdle,
            unregister,
        };
        // @ts-ignore
        window.waitBatchers.push(waitBatcher);
        return waitBatcher;
    }
    exports.createWaitBatcher = createWaitBatcher;

    return exports;
}