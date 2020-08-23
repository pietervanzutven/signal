(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.backbone = window.ts.backbone || {};
    const exports = window.ts.backbone.Conversation = {};

    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const is_1 = __importDefault(window.sindresorhus.is);
    const deferred_to_promise_1 = window.deferred_to_promise;
    exports.fetchVisualMediaAttachments = ({ conversationId, WhisperMessageCollection, }) => __awaiter(this, void 0, void 0, function* () {
        if (!is_1.default.string(conversationId)) {
            throw new TypeError("'conversationId' is required");
        }
        if (!is_1.default.object(WhisperMessageCollection)) {
            throw new TypeError("'WhisperMessageCollection' is required");
        }
        const collection = new WhisperMessageCollection();
        const lowerReceivedAt = 0;
        const upperReceivedAt = Number.MAX_VALUE;
        const hasVisualMediaAttachments = 1;
        yield deferred_to_promise_1.deferredToPromise(collection.fetch({
            index: {
                name: 'hasVisualMediaAttachments',
                lower: [conversationId, lowerReceivedAt, hasVisualMediaAttachments],
                upper: [conversationId, upperReceivedAt, hasVisualMediaAttachments],
                order: 'desc',
            },
            limit: 50,
        }));
        return collection.models.map(model => model.toJSON());
    });
})();