function require_ts_util_batcher() {
    "use strict";

    const exports = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const p_queue_1 = __importDefault(window.p_queue);
    // @ts-ignore
    window.batchers = [];
    // @ts-ignore
    window.waitForAllBatchers = async () => {
        // @ts-ignore
        await Promise.all(window.batchers.map(item => item.onIdle()));
    };
    async function sleep(ms) {
        // tslint:disable-next-line:no-string-based-set-timeout
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    function createBatcher(options) {
        let batcher;
        let timeout;
        let items = [];
        const queue = new p_queue_1.default({ concurrency: 1 });
        function _kickBatchOff() {
            const itemsRef = items;
            items = [];
            // tslint:disable-next-line:no-floating-promises
            queue.add(async () => {
                await options.processBatch(itemsRef);
            });
        }
        function add(item) {
            items.push(item);
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
            window.batchers = window.batchers.filter((item) => item !== batcher);
        }
        batcher = {
            add,
            anyPending,
            onIdle,
            unregister,
        };
        // @ts-ignore
        window.batchers.push(batcher);
        return batcher;
    }
    exports.createBatcher = createBatcher;

    return exports;
}