(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure;

    // tslint:disable no-default-export
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const EventTarget_1 = __importDefault(require("./EventTarget"));
    const AccountManager_1 = __importDefault(require("./AccountManager"));
    const MessageReceiver_1 = __importDefault(require("./MessageReceiver"));
    const Helpers_1 = __importDefault(require("./Helpers"));
    const Crypto_1 = __importDefault(require("./Crypto"));
    const ContactsParser_1 = require("./ContactsParser");
    const TaskWithTimeout_1 = __importDefault(require("./TaskWithTimeout"));
    const SyncRequest_1 = __importDefault(require("./SyncRequest"));
    const SendMessage_1 = __importDefault(require("./SendMessage"));
    const StringView_1 = __importDefault(require("./StringView"));
    const Storage_1 = __importDefault(require("./Storage"));
    const WebAPI = __importStar(require("./WebAPI"));
    const WebsocketResources_1 = __importDefault(require("./WebsocketResources"));
    exports.textsecure = {
        createTaskWithTimeout: TaskWithTimeout_1.default,
        crypto: Crypto_1.default,
        utils: Helpers_1.default,
        storage: Storage_1.default,
        AccountManager: AccountManager_1.default,
        ContactBuffer: ContactsParser_1.ContactBuffer,
        EventTarget: EventTarget_1.default,
        GroupBuffer: ContactsParser_1.GroupBuffer,
        MessageReceiver: MessageReceiver_1.default,
        MessageSender: SendMessage_1.default,
        SyncRequest: SyncRequest_1.default,
        StringView: StringView_1.default,
        WebAPI,
        WebSocketResource: WebsocketResources_1.default,
    };
    exports.default = exports.textsecure;
})();