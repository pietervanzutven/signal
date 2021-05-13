require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const p_queue_1 = __importDefault(require("p-queue"));
    const TaskWithTimeout_1 = __importDefault(require("../textsecure/TaskWithTimeout"));
    function createJobQueue(label) {
        const jobQueue = new p_queue_1.default({ concurrency: 1 });
        return (job, id = '') => {
            const taskWithTimeout = TaskWithTimeout_1.default(job, `${label} ${id}`);
            return jobQueue.add(taskWithTimeout);
        };
    }
    exports.storageJobQueue = createJobQueue('storageService');
});