require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const p_queue_1 = __importDefault(require("p-queue"));
    const sleep_1 = require("./sleep");
    window.waitBatchers = [];
    window.waitForAllWaitBatchers = async () => {
        await Promise.all(window.waitBatchers.map(item => item.onIdle()));
    };
    function createWaitBatcher(options) {
        let waitBatcher;
        let timeout;
        let items = [];
        const queue = new p_queue_1.default({ concurrency: 1, timeout: 1000 * 60 * 2 });
        function _kickBatchOff() {
            const itemsRef = items;
            items = [];
            queue.add(async () => {
                try {
                    await options.processBatch(itemsRef.map(item => item.item));
                    itemsRef.forEach(item => {
                        if (item.resolve) {
                            item.resolve();
                        }
                    });
                }
                catch (error) {
                    itemsRef.forEach(item => {
                        if (item.reject) {
                            item.reject(error);
                        }
                    });
                }
            });
        }
        function _makeExplodedPromise() {
            let resolve;
            let reject;
            const promise = new Promise((resolveParam, rejectParam) => {
                resolve = resolveParam;
                reject = rejectParam;
            });
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
                    // eslint-disable-next-line no-await-in-loop
                    await queue.onIdle();
                }
                if (items.length > 0) {
                    // eslint-disable-next-line no-await-in-loop
                    await sleep_1.sleep(options.wait * 2);
                }
            }
        }
        function unregister() {
            window.waitBatchers = window.waitBatchers.filter(item => item !== waitBatcher);
        }
        waitBatcher = {
            add,
            anyPending,
            onIdle,
            unregister,
        };
        window.waitBatchers.push(waitBatcher);
        return waitBatcher;
    }
    exports.createWaitBatcher = createWaitBatcher;
});