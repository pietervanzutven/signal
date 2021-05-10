require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const p_queue_1 = __importDefault(require("p-queue"));
    window.batchers = [];
    window.waitForAllBatchers = async () => {
        await Promise.all(window.batchers.map(item => item.flushAndWait()));
    };
    async function sleep(ms) {
        // tslint:disable-next-line:no-string-based-set-timeout
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    function createBatcher(options) {
        let batcher;
        let timeout;
        let items = [];
        const queue = new p_queue_1.default({ concurrency: 1, timeout: 1000 * 60 * 2 });
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
                    // eslint-disable-next-line no-await-in-loop
                    await queue.onIdle();
                }
                if (items.length > 0) {
                    // eslint-disable-next-line no-await-in-loop
                    await sleep(options.wait * 2);
                }
            }
        }
        function unregister() {
            window.batchers = window.batchers.filter(item => item !== batcher);
        }
        async function flushAndWait() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            if (items.length) {
                _kickBatchOff();
            }
            return onIdle();
        }
        batcher = {
            add,
            anyPending,
            onIdle,
            flushAndWait,
            unregister,
        };
        window.batchers.push(batcher);
        return batcher;
    }
    exports.createBatcher = createBatcher;
});