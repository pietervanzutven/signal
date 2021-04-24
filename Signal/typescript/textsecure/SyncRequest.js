(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.SyncRequest = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const EventTarget_1 = __importDefault(window.ts.textsecure.EventTarget);
    const MessageReceiver_1 = __importDefault(window.ts.textsecure.MessageReceiver);
    const SendMessage_1 = __importDefault(window.ts.textsecure.SendMessage);
    class SyncRequestInner extends EventTarget_1.default {
        constructor(sender, receiver) {
            super();
            if (!(sender instanceof SendMessage_1.default) ||
                !(receiver instanceof MessageReceiver_1.default)) {
                throw new Error('Tried to construct a SyncRequest without MessageSender and MessageReceiver');
            }
            this.receiver = receiver;
            this.oncontact = this.onContactSyncComplete.bind(this);
            receiver.addEventListener('contactsync', this.oncontact);
            this.ongroup = this.onGroupSyncComplete.bind(this);
            receiver.addEventListener('groupsync', this.ongroup);
            const ourNumber = window.textsecure.storage.user.getNumber();
            const { wrap, sendOptions } = window.ConversationController.prepareForSend(ourNumber, {
                syncMessage: true,
            });
            window.log.info('SyncRequest created. Sending config sync request...');
            // tslint:disable
            wrap(sender.sendRequestConfigurationSyncMessage(sendOptions));
            window.log.info('SyncRequest now sending block sync request...');
            wrap(sender.sendRequestBlockSyncMessage(sendOptions));
            window.log.info('SyncRequest now sending contact sync message...');
            wrap(sender.sendRequestContactSyncMessage(sendOptions))
                .then(() => {
                    window.log.info('SyncRequest now sending group sync messsage...');
                    return wrap(sender.sendRequestGroupSyncMessage(sendOptions));
                })
                .catch((error) => {
                    window.log.error('SyncRequest error:', error && error.stack ? error.stack : error);
                });
            this.timeout = setTimeout(this.onTimeout.bind(this), 60000);
        }
        onContactSyncComplete() {
            this.contactSync = true;
            this.update();
        }
        onGroupSyncComplete() {
            this.groupSync = true;
            this.update();
        }
        update() {
            if (this.contactSync && this.groupSync) {
                this.dispatchEvent(new Event('success'));
                this.cleanup();
            }
        }
        onTimeout() {
            if (this.contactSync || this.groupSync) {
                this.dispatchEvent(new Event('success'));
            }
            else {
                this.dispatchEvent(new Event('timeout'));
            }
            this.cleanup();
        }
        cleanup() {
            clearTimeout(this.timeout);
            this.receiver.removeEventListener('contactsync', this.oncontact);
            this.receiver.removeEventListener('groupSync', this.ongroup);
            delete this.listeners;
        }
    }
    class SyncRequest {
        constructor(sender, receiver) {
            const inner = new SyncRequestInner(sender, receiver);
            this.addEventListener = inner.addEventListener.bind(inner);
            this.removeEventListener = inner.removeEventListener.bind(inner);
        }
    }
    exports.default = SyncRequest;
})();