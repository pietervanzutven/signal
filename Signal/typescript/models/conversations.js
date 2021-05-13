require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /* eslint-disable more/no-then */
    window.Whisper = window.Whisper || {};
    const SEALED_SENDER = {
        UNKNOWN: 0,
        ENABLED: 1,
        DISABLED: 2,
        UNRESTRICTED: 3,
    };
    const { Services, Util } = window.Signal;
    const { Contact, Message } = window.Signal.Types;
    const { deleteAttachmentData, doesAttachmentExist, getAbsoluteAttachmentPath, loadAttachmentData, readStickerData, upgradeMessageSchema, writeNewAttachmentData, } = window.Signal.Migrations;
    const { addStickerPackReference } = window.Signal.Data;
    const { arrayBufferToBase64, base64ToArrayBuffer, deriveAccessKey, getRandomBytes, stringFromBytes, verifyAccessKey, } = window.Signal.Crypto;
    const COLORS = [
        'red',
        'deep_orange',
        'brown',
        'pink',
        'purple',
        'indigo',
        'blue',
        'teal',
        'green',
        'light_green',
        'blue_grey',
        'ultramarine',
    ];
    class ConversationModel extends window.Backbone.Model {
        // eslint-disable-next-line class-methods-use-this
        defaults() {
            return {
                unreadCount: 0,
                verified: window.textsecure.storage.protocol.VerifiedStatus.DEFAULT,
                messageCount: 0,
                sentMessageCount: 0,
            };
        }
        idForLogging() {
            if (this.isPrivate()) {
                const uuid = this.get('uuid');
                const e164 = this.get('e164');
                return `${uuid || e164} (${this.id})`;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (this.get('groupVersion') > 1) {
                return `groupv2(${this.get('groupId')})`;
            }
            const groupId = this.get('groupId');
            return `group(${groupId})`;
        }
        debugID() {
            const uuid = this.get('uuid');
            const e164 = this.get('e164');
            const groupId = this.get('groupId');
            return `group(${groupId}), sender(${uuid || e164}), id(${this.id})`;
        }
        // This is one of the few times that we want to collapse our uuid/e164 pair down into
        //   just one bit of data. If we have a UUID, we'll send using it.
        getSendTarget() {
            return this.get('uuid') || this.get('e164');
        }
        handleMessageError(message, errors) {
            this.trigger('messageError', message, errors);
        }
        // eslint-disable-next-line class-methods-use-this
        getContactCollection() {
            const collection = new window.Backbone.Collection();
            const collator = new Intl.Collator();
            collection.comparator = (left, right) => {
                const leftLower = left.getTitle().toLowerCase();
                const rightLower = right.getTitle().toLowerCase();
                return collator.compare(leftLower, rightLower);
            };
            return collection;
        }
        initialize(attributes = {}) {
            if (window.isValidE164(attributes.id)) {
                this.set({ id: window.getGuid(), e164: attributes.id });
            }
            this.storeName = 'conversations';
            this.ourNumber = window.textsecure.storage.user.getNumber();
            this.ourUuid = window.textsecure.storage.user.getUuid();
            this.verifiedEnum = window.textsecure.storage.protocol.VerifiedStatus;
            this.messageRequestEnum =
                window.textsecure.protobuf.SyncMessage.MessageRequestResponse.Type;
            // This may be overridden by window.ConversationController.getOrCreate, and signify
            //   our first save to the database. Or first fetch from the database.
            this.initialPromise = Promise.resolve();
            this.contactCollection = this.getContactCollection();
            this.messageCollection = new window.Whisper.MessageCollection([], {
                conversation: this,
            });
            this.messageCollection.on('change:errors', this.handleMessageError, this);
            this.messageCollection.on('send-error', this.onMessageError, this);
            this.throttledBumpTyping = window._.throttle(this.bumpTyping, 300);
            this.debouncedUpdateLastMessage = window._.debounce(this.updateLastMessage.bind(this), 200);
            this.listenTo(this.messageCollection, 'add remove destroy content-changed', this.debouncedUpdateLastMessage);
            this.listenTo(this.messageCollection, 'sent', this.updateLastMessage);
            this.listenTo(this.messageCollection, 'send-error', this.updateLastMessage);
            this.on('newmessage', this.onNewMessage);
            this.on('change:profileKey', this.onChangeProfileKey);
            // Listening for out-of-band data updates
            this.on('delivered', this.updateAndMerge);
            this.on('read', this.updateAndMerge);
            this.on('expiration-change', this.updateAndMerge);
            this.on('expired', this.onExpired);
            const sealedSender = this.get('sealedSender');
            if (sealedSender === undefined) {
                this.set({ sealedSender: SEALED_SENDER.UNKNOWN });
            }
            this.unset('unidentifiedDelivery');
            this.unset('unidentifiedDeliveryUnrestricted');
            this.unset('hasFetchedProfile');
            this.unset('tokens');
            this.typingRefreshTimer = null;
            this.typingPauseTimer = null;
            // Keep props ready
            this.generateProps = () => {
                this.cachedProps = this.getProps();
            };
            this.on('change', this.generateProps);
            this.generateProps();
        }
        isMe() {
            const e164 = this.get('e164');
            const uuid = this.get('uuid');
            return ((e164 && e164 === this.ourNumber) ||
                (uuid && uuid === this.ourUuid));
        }
        isEverUnregistered() {
            return Boolean(this.get('discoveredUnregisteredAt'));
        }
        isUnregistered() {
            const now = Date.now();
            const sixHoursAgo = now - 1000 * 60 * 60 * 6;
            const discoveredUnregisteredAt = this.get('discoveredUnregisteredAt');
            if (discoveredUnregisteredAt && discoveredUnregisteredAt > sixHoursAgo) {
                return true;
            }
            return false;
        }
        setUnregistered() {
            window.log.info(`Conversation ${this.idForLogging()} is now unregistered`);
            this.set({
                discoveredUnregisteredAt: Date.now(),
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        setRegistered() {
            window.log.info(`Conversation ${this.idForLogging()} is registered once again`);
            this.set({
                discoveredUnregisteredAt: undefined,
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        isBlocked() {
            const uuid = this.get('uuid');
            if (uuid) {
                return window.storage.isUuidBlocked(uuid);
            }
            const e164 = this.get('e164');
            if (e164) {
                return window.storage.isBlocked(e164);
            }
            const groupId = this.get('groupId');
            if (groupId) {
                return window.storage.isGroupBlocked(groupId);
            }
            return false;
        }
        block({ viaStorageServiceSync = false } = {}) {
            let blocked = false;
            const isBlocked = this.isBlocked();
            const uuid = this.get('uuid');
            if (uuid) {
                window.storage.addBlockedUuid(uuid);
                blocked = true;
            }
            const e164 = this.get('e164');
            if (e164) {
                window.storage.addBlockedNumber(e164);
                blocked = true;
            }
            const groupId = this.get('groupId');
            if (groupId) {
                window.storage.addBlockedGroup(groupId);
                blocked = true;
            }
            if (!viaStorageServiceSync && !isBlocked && blocked) {
                this.captureChange();
            }
        }
        unblock({ viaStorageServiceSync = false } = {}) {
            let unblocked = false;
            const isBlocked = this.isBlocked();
            const uuid = this.get('uuid');
            if (uuid) {
                window.storage.removeBlockedUuid(uuid);
                unblocked = true;
            }
            const e164 = this.get('e164');
            if (e164) {
                window.storage.removeBlockedNumber(e164);
                unblocked = true;
            }
            const groupId = this.get('groupId');
            if (groupId) {
                window.storage.removeBlockedGroup(groupId);
                unblocked = true;
            }
            if (!viaStorageServiceSync && isBlocked && unblocked) {
                this.captureChange();
            }
            return unblocked;
        }
        enableProfileSharing({ viaStorageServiceSync = false } = {}) {
            const before = this.get('profileSharing');
            this.set({ profileSharing: true });
            const after = this.get('profileSharing');
            if (!viaStorageServiceSync && Boolean(before) !== Boolean(after)) {
                this.captureChange();
            }
        }
        disableProfileSharing({ viaStorageServiceSync = false } = {}) {
            const before = this.get('profileSharing');
            this.set({ profileSharing: false });
            const after = this.get('profileSharing');
            if (!viaStorageServiceSync && Boolean(before) !== Boolean(after)) {
                this.captureChange();
            }
        }
        hasDraft() {
            const draftAttachments = this.get('draftAttachments') || [];
            return (this.get('draft') ||
                this.get('quotedMessageId') ||
                draftAttachments.length > 0);
        }
        getDraftPreview() {
            const draft = this.get('draft');
            if (draft) {
                return draft;
            }
            const draftAttachments = this.get('draftAttachments') || [];
            if (draftAttachments.length > 0) {
                return window.i18n('Conversation--getDraftPreview--attachment');
            }
            const quotedMessageId = this.get('quotedMessageId');
            if (quotedMessageId) {
                return window.i18n('Conversation--getDraftPreview--quote');
            }
            return window.i18n('Conversation--getDraftPreview--draft');
        }
        bumpTyping() {
            // We don't send typing messages if the setting is disabled
            if (!window.storage.get('typingIndicators')) {
                return;
            }
            if (!this.typingRefreshTimer) {
                const isTyping = true;
                this.setTypingRefreshTimer();
                this.sendTypingMessage(isTyping);
            }
            this.setTypingPauseTimer();
        }
        setTypingRefreshTimer() {
            if (this.typingRefreshTimer) {
                clearTimeout(this.typingRefreshTimer);
            }
            this.typingRefreshTimer = setTimeout(this.onTypingRefreshTimeout.bind(this), 10 * 1000);
        }
        onTypingRefreshTimeout() {
            const isTyping = true;
            this.sendTypingMessage(isTyping);
            // This timer will continue to reset itself until the pause timer stops it
            this.setTypingRefreshTimer();
        }
        setTypingPauseTimer() {
            if (this.typingPauseTimer) {
                clearTimeout(this.typingPauseTimer);
            }
            this.typingPauseTimer = setTimeout(this.onTypingPauseTimeout.bind(this), 3 * 1000);
        }
        onTypingPauseTimeout() {
            const isTyping = false;
            this.sendTypingMessage(isTyping);
            this.clearTypingTimers();
        }
        clearTypingTimers() {
            if (this.typingPauseTimer) {
                clearTimeout(this.typingPauseTimer);
                this.typingPauseTimer = null;
            }
            if (this.typingRefreshTimer) {
                clearTimeout(this.typingRefreshTimer);
                this.typingRefreshTimer = null;
            }
        }
        async fetchLatestGroupV2Data() {
            if (this.get('groupVersion') !== 2) {
                return;
            }
            await window.Signal.Groups.waitThenMaybeUpdateGroup({
                conversation: this,
            });
        }
        maybeRepairGroupV2(data) {
            if (this.get('groupVersion') &&
                this.get('masterKey') &&
                this.get('secretParams') &&
                this.get('publicParams')) {
                return;
            }
            window.log.info(`Repairing GroupV2 conversation ${this.idForLogging()}`);
            const { masterKey, secretParams, publicParams } = data;
            this.set({ masterKey, secretParams, publicParams, groupVersion: 2 });
            window.Signal.Data.updateConversation(this.attributes);
        }
        getGroupV2Info(groupChange) {
            if (this.isPrivate() || this.get('groupVersion') !== 2) {
                return undefined;
            }
            return {
                masterKey: window.Signal.Crypto.base64ToArrayBuffer(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('masterKey')),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                revision: this.get('revision'),
                members: this.getRecipients(),
                groupChange,
            };
        }
        getGroupV1Info() {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (this.isPrivate() || this.get('groupVersion') > 0) {
                return undefined;
            }
            return {
                id: this.get('groupId'),
                members: this.getRecipients(),
            };
        }
        sendTypingMessage(isTyping) {
            if (!window.textsecure.messaging) {
                return;
            }
            // We don't send typing messages to our other devices
            if (this.isMe()) {
                return;
            }
            const recipientId = this.isPrivate() ? this.getSendTarget() : undefined;
            const groupId = !this.isPrivate() ? this.get('groupId') : undefined;
            const groupMembers = this.getRecipients();
            // We don't send typing messages if our recipients list is empty
            if (!this.isPrivate() && !groupMembers.length) {
                return;
            }
            const sendOptions = this.getSendOptions();
            this.wrapSend(window.textsecure.messaging.sendTypingMessage({
                isTyping,
                recipientId,
                groupId,
                groupMembers,
            }, sendOptions));
        }
        async cleanup() {
            await window.Signal.Types.Conversation.deleteExternalFiles(this.attributes, {
                deleteAttachmentData,
            });
        }
        async updateAndMerge(message) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.debouncedUpdateLastMessage();
            const mergeMessage = () => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const existing = this.messageCollection.get(message.id);
                if (!existing) {
                    return;
                }
                existing.merge(message.attributes);
            };
            await this.inProgressFetch;
            mergeMessage();
        }
        async onExpired(message) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.debouncedUpdateLastMessage();
            const removeMessage = () => {
                const { id } = message;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const existing = this.messageCollection.get(id);
                if (!existing) {
                    return;
                }
                window.log.info('Remove expired message from collection', {
                    sentAt: existing.get('sent_at'),
                });
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.messageCollection.remove(id);
                existing.trigger('expired');
                existing.cleanup();
                // An expired message only counts as decrementing the message count, not
                // the sent message count
                this.decrementMessageCount();
            };
            // If a fetch is in progress, then we need to wait until that's complete to
            //   do this removal. Otherwise we could remove from messageCollection, then
            //   the async database fetch could include the removed message.
            await this.inProgressFetch;
            removeMessage();
        }
        async onNewMessage(message) {
            const uuid = message.get ? message.get('sourceUuid') : message.sourceUuid;
            const e164 = message.get ? message.get('source') : message.source;
            const sourceDevice = message.get
                ? message.get('sourceDevice')
                : message.sourceDevice;
            const sourceId = window.ConversationController.ensureContactIds({
                uuid,
                e164,
            });
            const typingToken = `${sourceId}.${sourceDevice}`;
            // Clear typing indicator for a given contact if we receive a message from them
            this.clearContactTypingTimer(typingToken);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.debouncedUpdateLastMessage();
        }
        // For outgoing messages, we can call this directly. We're already loaded.
        addSingleMessage(message) {
            const { id } = message;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const existing = this.messageCollection.get(id);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const model = this.messageCollection.add(message, { merge: true });
            model.setToExpire();
            if (!existing) {
                const { messagesAdded } = window.reduxActions.conversations;
                const isNewMessage = true;
                messagesAdded(this.id, [model.getReduxData()], isNewMessage, window.isActive());
            }
            return model;
        }
        // For incoming messages, they might arrive while we're in the middle of a bulk fetch
        //   from the database. We'll wait until that is done to process this newly-arrived
        //   message.
        addIncomingMessage(message) {
            if (!this.incomingMessageQueue) {
                this.incomingMessageQueue = new window.PQueue({
                    concurrency: 1,
                    timeout: 1000 * 60 * 2,
                });
            }
            // We use a queue here to ensure messages are added to the UI in the order received
            this.incomingMessageQueue.add(async () => {
                await this.inProgressFetch;
                this.addSingleMessage(message);
            });
        }
        format() {
            return this.cachedProps;
        }
        getProps() {
            // This is to prevent race conditions on startup; Conversation models are created
            //   but the full window.ConversationController.load() sequence isn't complete. So, we
            //   don't cache props on create, but we do later when load() calls generateProps()
            //   for us.
            if (!window.ConversationController.isFetchComplete()) {
                return null;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const color = this.getColor();
            const typingValues = window._.values(this.contactTypingTimers || {});
            const typingMostRecent = window._.first(window._.sortBy(typingValues, 'timestamp'));
            const typingContact = typingMostRecent
                ? window.ConversationController.get(typingMostRecent.senderId)
                : null;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const timestamp = this.get('timestamp');
            const draftTimestamp = this.get('draftTimestamp');
            const draftPreview = this.getDraftPreview();
            const draftText = this.get('draft');
            const shouldShowDraft = (this.hasDraft() &&
                draftTimestamp &&
                draftTimestamp >= timestamp);
            const inboxPosition = this.get('inbox_position');
            const messageRequestsEnabled = window.Signal.RemoteConfig.isEnabled('desktop.messageRequests');
            // TODO: DESKTOP-720
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            const result = {
                id: this.id,
                uuid: this.get('uuid'),
                e164: this.get('e164'),
                acceptedMessageRequest: this.getAccepted(),
                activeAt: this.get('active_at'),
                avatarPath: this.getAvatarPath(),
                color,
                draftPreview,
                draftText,
                firstName: this.get('profileName'),
                inboxPosition,
                isAccepted: this.getAccepted(),
                isArchived: this.get('isArchived'),
                isBlocked: this.isBlocked(),
                isMe: this.isMe(),
                isVerified: this.isVerified(),
                lastMessage: {
                    status: this.get('lastMessageStatus'),
                    text: this.get('lastMessage'),
                    deletedForEveryone: this.get('lastMessageDeletedForEveryone'),
                },
                lastUpdated: this.get('timestamp'),
                membersCount: this.isPrivate()
                    ? undefined
                    : (this.get('membersV2') || this.get('members') || []).length,
                messageRequestsEnabled,
                muteExpiresAt: this.get('muteExpiresAt'),
                name: this.get('name'),
                phoneNumber: this.getNumber(),
                profileName: this.getProfileName(),
                sharedGroupNames: this.get('sharedGroupNames'),
                shouldShowDraft,
                timestamp,
                title: this.getTitle(),
                type: (this.isPrivate() ? 'direct' : 'group'),
                typingContact: typingContact ? typingContact.format() : null,
                unreadCount: this.get('unreadCount') || 0,
            };
            /* eslint-enable @typescript-eslint/no-non-null-assertion */
            return result;
        }
        updateE164(e164) {
            const oldValue = this.get('e164');
            if (e164 && e164 !== oldValue) {
                this.set('e164', e164);
                window.Signal.Data.updateConversation(this.attributes);
                this.trigger('idUpdated', this, 'e164', oldValue);
            }
        }
        updateUuid(uuid) {
            const oldValue = this.get('uuid');
            if (uuid && uuid !== oldValue) {
                this.set('uuid', uuid.toLowerCase());
                window.Signal.Data.updateConversation(this.attributes);
                this.trigger('idUpdated', this, 'uuid', oldValue);
            }
        }
        updateGroupId(groupId) {
            const oldValue = this.get('groupId');
            if (groupId && groupId !== oldValue) {
                this.set('groupId', groupId);
                window.Signal.Data.updateConversation(this.attributes);
                this.trigger('idUpdated', this, 'groupId', oldValue);
            }
        }
        incrementMessageCount() {
            this.set({
                messageCount: (this.get('messageCount') || 0) + 1,
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        decrementMessageCount() {
            this.set({
                messageCount: Math.max((this.get('messageCount') || 0) - 1, 0),
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        incrementSentMessageCount() {
            this.set({
                messageCount: (this.get('messageCount') || 0) + 1,
                sentMessageCount: (this.get('sentMessageCount') || 0) + 1,
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        decrementSentMessageCount() {
            this.set({
                messageCount: Math.max((this.get('messageCount') || 0) - 1, 0),
                sentMessageCount: Math.max((this.get('sentMessageCount') || 0) - 1, 0),
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        /**
         * This function is called when a message request is accepted in order to
         * handle sending read receipts and download any pending attachments.
         */
        async handleReadAndDownloadAttachments() {
            let messages;
            do {
                const first = messages ? messages.first() : undefined;
                // eslint-disable-next-line no-await-in-loop
                messages = await window.Signal.Data.getOlderMessagesByConversation(this.get('id'), {
                    MessageCollection: window.Whisper.MessageCollection,
                    limit: 100,
                    receivedAt: first ? first.get('received_at') : undefined,
                    messageId: first ? first.id : undefined,
                });
                if (!messages.length) {
                    return;
                }
                const readMessages = messages.filter(m => !m.hasErrors() && m.isIncoming());
                const receiptSpecs = readMessages.map(m => ({
                    senderE164: m.get('source'),
                    senderUuid: m.get('sourceUuid'),
                    senderId: window.ConversationController.ensureContactIds({
                        e164: m.get('source'),
                        uuid: m.get('sourceUuid'),
                    }),
                    timestamp: m.get('sent_at'),
                    hasErrors: m.hasErrors(),
                }));
                // eslint-disable-next-line no-await-in-loop
                await this.sendReadReceiptsFor(receiptSpecs);
                // eslint-disable-next-line no-await-in-loop
                await Promise.all(readMessages.map(m => m.queueAttachmentDownloads()));
            } while (messages.length > 0);
        }
        async applyMessageRequestResponse(response, { fromSync = false, viaStorageServiceSync = false } = {}) {
            // Apply message request response locally
            this.set({
                messageRequestResponseType: response,
            });
            window.Signal.Data.updateConversation(this.attributes);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (response === this.messageRequestEnum.ACCEPT) {
                this.unblock({ viaStorageServiceSync });
                this.enableProfileSharing({ viaStorageServiceSync });
                if (!fromSync) {
                    this.sendProfileKeyUpdate();
                    // Locally accepted
                    await this.handleReadAndDownloadAttachments();
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            }
            else if (response === this.messageRequestEnum.BLOCK) {
                // Block locally, other devices should block upon receiving the sync message
                this.block({ viaStorageServiceSync });
                this.disableProfileSharing({ viaStorageServiceSync });
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            }
            else if (response === this.messageRequestEnum.DELETE) {
                // Delete messages locally, other devices should delete upon receiving
                // the sync message
                this.destroyMessages();
                this.disableProfileSharing({ viaStorageServiceSync });
                this.updateLastMessage();
                if (!fromSync) {
                    this.trigger('unload', 'deleted from message request');
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            }
            else if (response === this.messageRequestEnum.BLOCK_AND_DELETE) {
                // Delete messages locally, other devices should delete upon receiving
                // the sync message
                this.destroyMessages();
                this.disableProfileSharing({ viaStorageServiceSync });
                this.updateLastMessage();
                // Block locally, other devices should block upon receiving the sync message
                this.block({ viaStorageServiceSync });
                // Leave group if this was a local action
                if (!fromSync) {
                    // TODO: DESKTOP-721
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.leaveGroup();
                    this.trigger('unload', 'blocked and deleted from message request');
                }
            }
        }
        async syncMessageRequestResponse(response) {
            // Let this run, no await
            this.applyMessageRequestResponse(response);
            const { ourNumber, ourUuid } = this;
            const { wrap, sendOptions } = window.ConversationController.prepareForSend(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                ourNumber || ourUuid, {
                syncMessage: true,
            });
            await wrap(window.textsecure.messaging.syncMessageRequestResponse({
                threadE164: this.get('e164'),
                threadUuid: this.get('uuid'),
                groupId: this.get('groupId'),
                type: response,
            }, sendOptions));
        }
        onMessageError() {
            this.updateVerified();
        }
        async safeGetVerified() {
            const promise = window.textsecure.storage.protocol.getVerified(this.id);
            return promise.catch(() => window.textsecure.storage.protocol.VerifiedStatus.DEFAULT);
        }
        async updateVerified() {
            if (this.isPrivate()) {
                await this.initialPromise;
                const verified = await this.safeGetVerified();
                if (this.get('verified') !== verified) {
                    this.set({ verified });
                    window.Signal.Data.updateConversation(this.attributes);
                }
                return;
            }
            this.fetchContacts();
            await Promise.all(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.contactCollection.map(async (contact) => {
                    if (!contact.isMe()) {
                        await contact.updateVerified();
                    }
                }));
            this.onMemberVerifiedChange();
        }
        setVerifiedDefault(options) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { DEFAULT } = this.verifiedEnum;
            return this.queueJob(() => this._setVerified(DEFAULT, options));
        }
        setVerified(options) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { VERIFIED } = this.verifiedEnum;
            return this.queueJob(() => this._setVerified(VERIFIED, options));
        }
        setUnverified(options) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { UNVERIFIED } = this.verifiedEnum;
            return this.queueJob(() => this._setVerified(UNVERIFIED, options));
        }
        async _setVerified(verified, providedOptions) {
            const options = providedOptions || {};
            window._.defaults(options, {
                viaStorageServiceSync: false,
                viaSyncMessage: false,
                viaContactSync: false,
                key: null,
            });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const { VERIFIED, UNVERIFIED } = this.verifiedEnum;
            if (!this.isPrivate()) {
                throw new Error('You cannot verify a group conversation. ' +
                    'You must verify individual contacts.');
            }
            const beginningVerified = this.get('verified');
            let keyChange;
            if (options.viaSyncMessage) {
                // handle the incoming key from the sync messages - need different
                // behavior if that key doesn't match the current key
                keyChange = await window.textsecure.storage.protocol.processVerifiedMessage(this.id, verified,
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    options.key);
            }
            else {
                keyChange = await window.textsecure.storage.protocol.setVerified(this.id, verified);
            }
            this.set({ verified });
            window.Signal.Data.updateConversation(this.attributes);
            if (!options.viaStorageServiceSync &&
                !keyChange &&
                beginningVerified !== verified) {
                this.captureChange();
            }
            // Three situations result in a verification notice in the conversation:
            //   1) The message came from an explicit verification in another client (not
            //      a contact sync)
            //   2) The verification value received by the contact sync is different
            //      from what we have on record (and it's not a transition to UNVERIFIED)
            //   3) Our local verification status is VERIFIED and it hasn't changed,
            //      but the key did change (Key1/VERIFIED to Key2/VERIFIED - but we don't
            //      want to show DEFAULT->DEFAULT or UNVERIFIED->UNVERIFIED)
            if (!options.viaContactSync ||
                (beginningVerified !== verified && verified !== UNVERIFIED) ||
                (keyChange && verified === VERIFIED)) {
                await this.addVerifiedChange(this.id, verified === VERIFIED, {
                    local: !options.viaSyncMessage,
                });
            }
            if (!options.viaSyncMessage) {
                await this.sendVerifySyncMessage(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('e164'),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('uuid'), verified);
            }
            return keyChange;
        }
        async sendVerifySyncMessage(e164, uuid, state) {
            // Because syncVerification sends a (null) message to the target of the verify and
            //   a sync message to our own devices, we need to send the accessKeys down for both
            //   contacts. So we merge their sendOptions.
            const { sendOptions } = window.ConversationController.prepareForSend(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.ourNumber || this.ourUuid, { syncMessage: true });
            const contactSendOptions = this.getSendOptions();
            const options = Object.assign(Object.assign({}, sendOptions), contactSendOptions);
            const promise = window.textsecure.storage.protocol.loadIdentityKey(e164);
            return promise.then(key => this.wrapSend(window.textsecure.messaging.syncVerification(e164, uuid, state,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                key, options)));
        }
        isVerified() {
            if (this.isPrivate()) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                return this.get('verified') === this.verifiedEnum.VERIFIED;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!this.contactCollection.length) {
                return false;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.contactCollection.every(contact => {
                if (contact.isMe()) {
                    return true;
                }
                return contact.isVerified();
            });
        }
        isUnverified() {
            if (this.isPrivate()) {
                const verified = this.get('verified');
                return (
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    verified !== this.verifiedEnum.VERIFIED &&
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    verified !== this.verifiedEnum.DEFAULT);
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!this.contactCollection.length) {
                return true;
            }
            // Array.any does not exist. This is probably broken.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return this.contactCollection.any(contact => {
                if (contact.isMe()) {
                    return false;
                }
                return contact.isUnverified();
            });
        }
        getUnverified() {
            if (this.isPrivate()) {
                return this.isUnverified()
                    ? new window.Backbone.Collection([this])
                    : new window.Backbone.Collection();
            }
            return new window.Backbone.Collection(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.contactCollection.filter(contact => {
                    if (contact.isMe()) {
                        return false;
                    }
                    return contact.isUnverified();
                }));
        }
        setApproved() {
            if (!this.isPrivate()) {
                throw new Error('You cannot set a group conversation as trusted. ' +
                    'You must set individual contacts as trusted.');
            }
            return window.textsecure.storage.protocol.setApproval(this.id, true);
        }
        async safeIsUntrusted() {
            return window.textsecure.storage.protocol
                .isUntrusted(this.id)
                .catch(() => false);
        }
        async isUntrusted() {
            if (this.isPrivate()) {
                return this.safeIsUntrusted();
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            if (!this.contactCollection.length) {
                return Promise.resolve(false);
            }
            return Promise.all(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.contactCollection.map(contact => {
                    if (contact.isMe()) {
                        return false;
                    }
                    return contact.safeIsUntrusted();
                })).then(results => window._.any(results, result => result));
        }
        async getUntrusted() {
            // This is a bit ugly because isUntrusted() is async. Could do the work to cache
            //   it locally, but we really only need it for this call.
            if (this.isPrivate()) {
                return this.isUntrusted().then(untrusted => {
                    if (untrusted) {
                        return new window.Backbone.Collection([this]);
                    }
                    return new window.Backbone.Collection();
                });
            }
            return Promise.all(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.contactCollection.map(contact => {
                    if (contact.isMe()) {
                        return [false, contact];
                    }
                    return Promise.all([contact.isUntrusted(), contact]);
                })).then(results => {
                    const filtered = window._.filter(results, result => {
                        const untrusted = result[0];
                        return untrusted;
                    });
                    return new window.Backbone.Collection(window._.map(filtered, result => {
                        const contact = result[1];
                        return contact;
                    }));
                });
        }
        getSentMessageCount() {
            return this.get('sentMessageCount') || 0;
        }
        getMessageRequestResponseType() {
            return this.get('messageRequestResponseType') || 0;
        }
        /**
         * Determine if this conversation should be considered "accepted" in terms
         * of message requests
         */
        getAccepted() {
            const messageRequestsEnabled = window.Signal.RemoteConfig.isEnabled('desktop.messageRequests');
            if (!messageRequestsEnabled) {
                return true;
            }
            if (this.isMe()) {
                return true;
            }
            if (
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.getMessageRequestResponseType() === this.messageRequestEnum.ACCEPT) {
                return true;
            }
            const isFromOrAddedByTrustedContact = this.isFromOrAddedByTrustedContact();
            const hasSentMessages = this.getSentMessageCount() > 0;
            const hasMessagesBeforeMessageRequests = (this.get('messageCountBeforeMessageRequests') || 0) > 0;
            const hasNoMessages = (this.get('messageCount') || 0) === 0;
            const isEmptyPrivateConvo = hasNoMessages && this.isPrivate();
            const isEmptyWhitelistedGroup = hasNoMessages && !this.isPrivate() && this.get('profileSharing');
            return (isFromOrAddedByTrustedContact ||
                hasSentMessages ||
                hasMessagesBeforeMessageRequests ||
                // an empty group is the scenario where we need to rely on
                // whether the profile has already been shared or not
                isEmptyPrivateConvo ||
                isEmptyWhitelistedGroup);
        }
        onMemberVerifiedChange() {
            // If the verified state of a member changes, our aggregate state changes.
            // We trigger both events to replicate the behavior of window.Backbone.Model.set()
            this.trigger('change:verified', this);
            this.trigger('change', this);
        }
        async toggleVerified() {
            if (this.isVerified()) {
                return this.setVerifiedDefault();
            }
            return this.setVerified();
        }
        async addKeyChange(keyChangedId) {
            window.log.info('adding key change advisory for', this.idForLogging(), keyChangedId, this.get('timestamp'));
            const timestamp = Date.now();
            const message = {
                conversationId: this.id,
                type: 'keychange',
                sent_at: this.get('timestamp'),
                received_at: timestamp,
                key_changed: keyChangedId,
                unread: 1,
            };
            const id = await window.Signal.Data.saveMessage(message, {
                Message: window.Whisper.Message,
            });
            const model = window.MessageController.register(id, new window.Whisper.Message(Object.assign(Object.assign({}, message), { id })));
            this.trigger('newmessage', model);
        }
        async addVerifiedChange(verifiedChangeId, verified, providedOptions) {
            const options = providedOptions || {};
            window._.defaults(options, { local: true });
            if (this.isMe()) {
                window.log.info('refusing to add verified change advisory for our own number');
                return;
            }
            const lastMessage = this.get('timestamp') || Date.now();
            window.log.info('adding verified change advisory for', this.idForLogging(), verifiedChangeId, lastMessage);
            const timestamp = Date.now();
            const message = {
                conversationId: this.id,
                type: 'verified-change',
                sent_at: lastMessage,
                received_at: timestamp,
                verifiedChanged: verifiedChangeId,
                verified,
                local: options.local,
                unread: 1,
            };
            const id = await window.Signal.Data.saveMessage(message, {
                Message: window.Whisper.Message,
            });
            const model = window.MessageController.register(id, new window.Whisper.Message(Object.assign(Object.assign({}, message), { id })));
            this.trigger('newmessage', model);
            if (this.isPrivate()) {
                window.ConversationController.getAllGroupsInvolvingId(this.id).then(groups => {
                    window._.forEach(groups, group => {
                        group.addVerifiedChange(this.id, verified, options);
                    });
                });
            }
        }
        async addCallHistory(callHistoryDetails) {
            const { acceptedTime, endedTime, wasDeclined } = callHistoryDetails;
            const message = {
                conversationId: this.id,
                type: 'call-history',
                sent_at: endedTime,
                received_at: endedTime,
                unread: !wasDeclined && !acceptedTime,
                callHistoryDetails,
            };
            const id = await window.Signal.Data.saveMessage(message, {
                Message: window.Whisper.Message,
            });
            const model = window.MessageController.register(id, new window.Whisper.Message(Object.assign(Object.assign({}, message), { id })));
            this.trigger('newmessage', model);
        }
        async addProfileChange(profileChange, conversationId) {
            const message = {
                conversationId: this.id,
                type: 'profile-change',
                sent_at: Date.now(),
                received_at: Date.now(),
                unread: true,
                changedId: conversationId || this.id,
                profileChange,
            };
            const id = await window.Signal.Data.saveMessage(message, {
                Message: window.Whisper.Message,
            });
            const model = window.MessageController.register(id, new window.Whisper.Message(Object.assign(Object.assign({}, message), { id })));
            this.trigger('newmessage', model);
            if (this.isPrivate()) {
                window.ConversationController.getAllGroupsInvolvingId(this.id).then(groups => {
                    window._.forEach(groups, group => {
                        group.addProfileChange(profileChange, this.id);
                    });
                });
            }
        }
        async onReadMessage(message, readAt) {
            // We mark as read everything older than this message - to clean up old stuff
            //   still marked unread in the database. If the user generally doesn't read in
            //   the desktop app, so the desktop app only gets read syncs, we can very
            //   easily end up with messages never marked as read (our previous early read
            //   sync handling, read syncs never sent because app was offline)
            // We queue it because we often get a whole lot of read syncs at once, and
            //   their markRead calls could very easily overlap given the async pull from DB.
            // Lastly, we don't send read syncs for any message marked read due to a read
            //   sync. That's a notification explosion we don't need.
            return this.queueJob(() =>
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.markRead(message.get('received_at'), {
                    sendReadReceipts: false,
                    readAt,
                }));
        }
        getUnread() {
            return window.Signal.Data.getUnreadByConversation(this.id, {
                MessageCollection: window.Whisper.MessageCollection,
            });
        }
        validate(attributes = this.attributes) {
            const required = ['type'];
            const missing = window._.filter(required, attr => !attributes[attr]);
            if (missing.length) {
                return `Conversation must have ${missing}`;
            }
            if (attributes.type !== 'private' && attributes.type !== 'group') {
                return `Invalid conversation type: ${attributes.type}`;
            }
            const atLeastOneOf = ['e164', 'uuid', 'groupId'];
            const hasAtLeastOneOf = window._.filter(atLeastOneOf, attr => attributes[attr]).length > 0;
            if (!hasAtLeastOneOf) {
                return 'Missing one of e164, uuid, or groupId';
            }
            const error = this.validateNumber() || this.validateUuid();
            if (error) {
                return error;
            }
            return null;
        }
        validateNumber() {
            if (this.isPrivate() && this.get('e164')) {
                const regionCode = window.storage.get('regionCode');
                const number = window.libphonenumber.util.parseNumber(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('e164'), regionCode);
                // TODO: DESKTOP-723
                // This is valid, but the typing thinks it's a function.
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (number.isValidNumber) {
                    this.set({ e164: number.e164 });
                    return null;
                }
                return number.error || 'Invalid phone number';
            }
            return null;
        }
        validateUuid() {
            if (this.isPrivate() && this.get('uuid')) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                if (window.isValidGuid(this.get('uuid'))) {
                    return null;
                }
                return 'Invalid UUID';
            }
            return null;
        }
        queueJob(callback) {
            this.jobQueue = this.jobQueue || new window.PQueue({ concurrency: 1 });
            const taskWithTimeout = window.textsecure.createTaskWithTimeout(callback, `conversation ${this.idForLogging()}`);
            return this.jobQueue.add(taskWithTimeout);
        }
        getMembers() {
            if (this.isPrivate()) {
                return [this];
            }
            if (this.get('membersV2')) {
                return window._.compact(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('membersV2').map(member => {
                        const c = window.ConversationController.get(member.conversationId);
                        // In groups we won't sent to contacts we believe are unregistered
                        if (c && c.isUnregistered()) {
                            return null;
                        }
                        return c;
                    }));
            }
            if (this.get('members')) {
                return window._.compact(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('members').map(id => {
                        const c = window.ConversationController.get(id);
                        // In groups we won't sent to contacts we believe are unregistered
                        if (c && c.isUnregistered()) {
                            return null;
                        }
                        return c;
                    }));
            }
            window.log.warn('getMembers: Group conversation had neither membersV2 nor members');
            return [];
        }
        getMemberIds() {
            const members = this.getMembers();
            return members.map(member => member.id);
        }
        getRecipients() {
            const members = this.getMembers();
            // Eliminate our
            return window._.compact(members.map(member => (member.isMe() ? null : member.getSendTarget())));
        }
        async getQuoteAttachment(attachments, preview, sticker) {
            if (attachments && attachments.length) {
                return Promise.all(attachments
                    .filter(attachment => attachment &&
                        attachment.contentType &&
                        !attachment.pending &&
                        !attachment.error)
                    .slice(0, 1)
                    .map(async (attachment) => {
                        const { fileName, thumbnail, contentType } = attachment;
                        return {
                            contentType,
                            // Our protos library complains about this field being undefined, so we
                            //   force it to null
                            fileName: fileName || null,
                            thumbnail: thumbnail
                                ? Object.assign(Object.assign({}, (await loadAttachmentData(thumbnail))), { objectUrl: getAbsoluteAttachmentPath(thumbnail.path) }) : null,
                        };
                    }));
            }
            if (preview && preview.length) {
                return Promise.all(preview
                    .filter(item => item && item.image)
                    .slice(0, 1)
                    .map(async (attachment) => {
                        const { image } = attachment;
                        const { contentType } = image;
                        return {
                            contentType,
                            // Our protos library complains about this field being undefined, so we
                            //   force it to null
                            fileName: null,
                            thumbnail: image
                                ? Object.assign(Object.assign({}, (await loadAttachmentData(image))), { objectUrl: getAbsoluteAttachmentPath(image.path) }) : null,
                        };
                    }));
            }
            if (sticker && sticker.data && sticker.data.path) {
                const { path, contentType } = sticker.data;
                return [
                    {
                        contentType,
                        // Our protos library complains about this field being undefined, so we
                        //   force it to null
                        fileName: null,
                        thumbnail: Object.assign(Object.assign({}, (await loadAttachmentData(sticker.data))), { objectUrl: getAbsoluteAttachmentPath(path) }),
                    },
                ];
            }
            return [];
        }
        async makeQuote(quotedMessage) {
            const { getName } = Contact;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const contact = quotedMessage.getContact();
            const attachments = quotedMessage.get('attachments');
            const preview = quotedMessage.get('preview');
            const sticker = quotedMessage.get('sticker');
            const body = quotedMessage.get('body');
            const embeddedContact = quotedMessage.get('contact');
            const embeddedContactName = embeddedContact && embeddedContact.length > 0
                ? getName(embeddedContact[0])
                : '';
            return {
                author: contact.get('e164'),
                authorUuid: contact.get('uuid'),
                bodyRanges: quotedMessage.get('bodyRanges'),
                id: quotedMessage.get('sent_at'),
                text: body || embeddedContactName,
                attachments: quotedMessage.isTapToView()
                    ? [{ contentType: 'image/jpeg', fileName: null }]
                    : await this.getQuoteAttachment(attachments, preview, sticker),
            };
        }
        async sendStickerMessage(packId, stickerId) {
            const packData = window.Signal.Stickers.getStickerPack(packId);
            const stickerData = window.Signal.Stickers.getSticker(packId, stickerId);
            if (!stickerData || !packData) {
                window.log.warn(`Attempted to send nonexistent (${packId}, ${stickerId}) sticker!`);
                return;
            }
            const { key } = packData;
            const { path, width, height } = stickerData;
            const arrayBuffer = await readStickerData(path);
            const sticker = {
                packId,
                stickerId,
                packKey: key,
                data: {
                    size: arrayBuffer.byteLength,
                    data: arrayBuffer,
                    contentType: 'image/webp',
                    width,
                    height,
                },
            };
            this.sendMessage(null, [], null, [], sticker);
            window.reduxActions.stickers.useSticker(packId, stickerId);
        }
        async sendReactionMessage(reaction, target) {
            const timestamp = Date.now();
            const outgoingReaction = Object.assign(Object.assign({}, reaction), target);
            const expireTimer = this.get('expireTimer');
            const reactionModel = window.Whisper.Reactions.add(Object.assign(Object.assign({}, outgoingReaction), { fromId: window.ConversationController.getOurConversationId(), timestamp, fromSync: true }));
            window.Whisper.Reactions.onReaction(reactionModel);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const destination = this.getSendTarget();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const recipients = this.getRecipients();
            let profileKey;
            if (this.get('profileSharing')) {
                profileKey = window.storage.get('profileKey');
            }
            return this.queueJob(async () => {
                window.log.info('Sending reaction to conversation', this.idForLogging(), 'with timestamp', timestamp);
                const attributes = {
                    id: window.getGuid(),
                    type: 'outgoing',
                    conversationId: this.get('id'),
                    sent_at: timestamp,
                    received_at: timestamp,
                    recipients,
                    reaction: outgoingReaction,
                };
                if (this.isPrivate()) {
                    attributes.destination = destination;
                }
                // We are only creating this model so we can use its sync message
                // sending functionality. It will not be saved to the datbase.
                const message = new window.Whisper.Message(attributes);
                // We're offline!
                if (!window.textsecure.messaging) {
                    throw new Error('Cannot send reaction while offline!');
                }
                // Special-case the self-send case - we send only a sync message
                if (this.isMe()) {
                    const dataMessage = await window.textsecure.messaging.getMessageProto(destination, undefined, // body
                        [], // attachments
                        undefined, // quote
                        [], // preview
                        undefined, // sticker
                        outgoingReaction, timestamp, expireTimer, profileKey);
                    return message.sendSyncMessageOnly(dataMessage);
                }
                const options = this.getSendOptions();
                const promise = (() => {
                    if (this.isPrivate()) {
                        return window.textsecure.messaging.sendMessageToIdentifier(destination, undefined, // body
                            [], // attachments
                            undefined, // quote
                            [], // preview
                            undefined, // sticker
                            outgoingReaction, timestamp, expireTimer, profileKey, options);
                    }
                    return window.textsecure.messaging.sendMessageToGroup({
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        groupV1: this.getGroupV1Info(),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        groupV2: this.getGroupV2Info(),
                        reaction: outgoingReaction,
                        timestamp,
                        expireTimer,
                        profileKey,
                    }, options);
                })();
                return message.send(this.wrapSend(promise));
            }).catch(error => {
                window.log.error('Error sending reaction', reaction, target, error);
                const reverseReaction = reactionModel.clone();
                reverseReaction.set('remove', !reverseReaction.get('remove'));
                window.Whisper.Reactions.onReaction(reverseReaction);
                throw error;
            });
        }
        async sendProfileKeyUpdate() {
            const id = this.get('id');
            const recipients = this.getRecipients();
            if (!this.get('profileSharing')) {
                window.log.error('Attempted to send profileKeyUpdate to conversation without profileSharing enabled', id, recipients);
                return;
            }
            window.log.info('Sending profileKeyUpdate to conversation', id, recipients);
            const profileKey = window.storage.get('profileKey');
            await window.textsecure.messaging.sendProfileKeyUpdate(profileKey, recipients, this.getSendOptions(), this.get('groupId'));
        }
        sendMessage(body, attachments, quote, preview, sticker) {
            this.clearTypingTimers();
            const { clearUnreadMetrics } = window.reduxActions.conversations;
            clearUnreadMetrics(this.id);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const destination = this.getSendTarget();
            const expireTimer = this.get('expireTimer');
            const recipients = this.getRecipients();
            let profileKey;
            if (this.get('profileSharing')) {
                profileKey = window.storage.get('profileKey');
            }
            this.queueJob(async () => {
                const now = Date.now();
                window.log.info('Sending message to conversation', this.idForLogging(), 'with timestamp', now);
                // Here we move attachments to disk
                const messageWithSchema = await upgradeMessageSchema({
                    type: 'outgoing',
                    body,
                    conversationId: this.id,
                    quote,
                    preview,
                    attachments,
                    sent_at: now,
                    received_at: now,
                    expireTimer,
                    recipients,
                    sticker,
                });
                if (this.isPrivate()) {
                    messageWithSchema.destination = destination;
                }
                const attributes = Object.assign(Object.assign({}, messageWithSchema), { id: window.getGuid() });
                const model = this.addSingleMessage(attributes);
                if (sticker) {
                    await addStickerPackReference(model.id, sticker.packId);
                }
                const message = window.MessageController.register(model.id, model);
                await window.Signal.Data.saveMessage(message.attributes, {
                    forceSave: true,
                    Message: window.Whisper.Message,
                });
                this.set({
                    lastMessage: model.getNotificationText(),
                    lastMessageStatus: 'sending',
                    active_at: now,
                    timestamp: now,
                    isArchived: false,
                    draft: null,
                    draftTimestamp: null,
                });
                this.incrementSentMessageCount();
                window.Signal.Data.updateConversation(this.attributes);
                // We're offline!
                if (!window.textsecure.messaging) {
                    const errors = [
                        ...(this.contactCollection && this.contactCollection.length
                            ? this.contactCollection
                            : [this]),
                    ].map(contact => {
                        const error = new Error('Network is not available');
                        error.name = 'SendMessageNetworkError';
                        error.identifier = contact.get('id');
                        return error;
                    });
                    await message.saveErrors(errors);
                    return null;
                }
                const attachmentsWithData = await Promise.all(messageWithSchema.attachments.map(loadAttachmentData));
                const { body: messageBody, attachments: finalAttachments, } = window.Whisper.Message.getLongMessageAttachment({
                    body,
                    attachments: attachmentsWithData,
                    now,
                });
                // Special-case the self-send case - we send only a sync message
                if (this.isMe()) {
                    const dataMessage = await window.textsecure.messaging.getMessageProto(destination, messageBody, finalAttachments, quote, preview, sticker, null, // reaction
                        now, expireTimer, profileKey);
                    return message.sendSyncMessageOnly(dataMessage);
                }
                const conversationType = this.get('type');
                const options = this.getSendOptions();
                let promise;
                if (conversationType === Message.GROUP) {
                    promise = window.textsecure.messaging.sendMessageToGroup({
                        attachments: finalAttachments,
                        expireTimer,
                        groupV1: this.getGroupV1Info(),
                        groupV2: this.getGroupV2Info(),
                        messageText: messageBody,
                        preview,
                        profileKey,
                        quote,
                        sticker,
                        timestamp: now,
                    }, options);
                }
                else {
                    promise = window.textsecure.messaging.sendMessageToIdentifier(destination, messageBody, finalAttachments, quote, preview, sticker, null, // reaction
                        now, expireTimer, profileKey, options);
                }
                return message.send(this.wrapSend(promise));
            });
        }
        async wrapSend(promise) {
            return promise.then(async (result) => {
                // success
                if (result) {
                    await this.handleMessageSendResult(result.failoverIdentifiers, result.unidentifiedDeliveries, result.discoveredIdentifierPairs);
                }
                return result;
            }, async (result) => {
                // failure
                if (result) {
                    await this.handleMessageSendResult(result.failoverIdentifiers, result.unidentifiedDeliveries, result.discoveredIdentifierPairs);
                }
                throw result;
            });
        }
        async handleMessageSendResult(failoverIdentifiers, unidentifiedDeliveries, discoveredIdentifierPairs) {
            (discoveredIdentifierPairs || []).forEach(item => {
                const { uuid, e164 } = item;
                window.ConversationController.ensureContactIds({
                    uuid,
                    e164,
                    highTrust: true,
                });
            });
            await Promise.all((failoverIdentifiers || []).map(async (identifier) => {
                const conversation = window.ConversationController.get(identifier);
                if (conversation &&
                    conversation.get('sealedSender') !== SEALED_SENDER.DISABLED) {
                    window.log.info(`Setting sealedSender to DISABLED for conversation ${conversation.idForLogging()}`);
                    conversation.set({
                        sealedSender: SEALED_SENDER.DISABLED,
                    });
                    window.Signal.Data.updateConversation(conversation.attributes);
                }
            }));
            await Promise.all((unidentifiedDeliveries || []).map(async (identifier) => {
                const conversation = window.ConversationController.get(identifier);
                if (conversation &&
                    conversation.get('sealedSender') === SEALED_SENDER.UNKNOWN) {
                    if (conversation.get('accessKey')) {
                        window.log.info(`Setting sealedSender to ENABLED for conversation ${conversation.idForLogging()}`);
                        conversation.set({
                            sealedSender: SEALED_SENDER.ENABLED,
                        });
                    }
                    else {
                        window.log.info(`Setting sealedSender to UNRESTRICTED for conversation ${conversation.idForLogging()}`);
                        conversation.set({
                            sealedSender: SEALED_SENDER.UNRESTRICTED,
                        });
                    }
                    window.Signal.Data.updateConversation(conversation.attributes);
                }
            }));
        }
        getSendOptions(options = {}) {
            const senderCertificate = window.storage.get('senderCertificate');
            const sendMetadata = this.getSendMetadata(options);
            return {
                senderCertificate,
                sendMetadata,
            };
        }
        getUuidCapable() {
            return Boolean(window._.property('uuid')(this.get('capabilities')));
        }
        getSendMetadata(options = {}) {
            const { syncMessage, disableMeCheck } = options;
            // START: this code has an Expiration date of ~2018/11/21
            // We don't want to enable unidentified delivery for send unless it is
            //   also enabled for our own account.
            const myId = window.ConversationController.getOurConversationId();
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const me = window.ConversationController.get(myId);
            if (!disableMeCheck && me.get('sealedSender') === SEALED_SENDER.DISABLED) {
                return null;
            }
            // END
            if (!this.isPrivate()) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const infoArray = this.contactCollection.map(conversation => conversation.getSendMetadata(options));
                return Object.assign({}, ...infoArray);
            }
            const accessKey = this.get('accessKey');
            const sealedSender = this.get('sealedSender');
            const uuidCapable = this.getUuidCapable();
            // We never send sync messages as sealed sender
            if (syncMessage && this.isMe()) {
                return null;
            }
            const e164 = this.get('e164');
            const uuid = this.get('uuid');
            // If we've never fetched user's profile, we default to what we have
            if (sealedSender === SEALED_SENDER.UNKNOWN) {
                const info = {
                    accessKey: accessKey || arrayBufferToBase64(getRandomBytes(16)),
                    // Indicates that a client is capable of receiving uuid-only messages.
                    // Not used yet.
                    uuidCapable,
                };
                return Object.assign(Object.assign({}, (e164 ? { [e164]: info } : {})), (uuid ? { [uuid]: info } : {}));
            }
            if (sealedSender === SEALED_SENDER.DISABLED) {
                return null;
            }
            const info = {
                accessKey: accessKey && sealedSender === SEALED_SENDER.ENABLED
                    ? accessKey
                    : arrayBufferToBase64(getRandomBytes(16)),
                // Indicates that a client is capable of receiving uuid-only messages.
                // Not used yet.
                uuidCapable,
            };
            return Object.assign(Object.assign({}, (e164 ? { [e164]: info } : {})), (uuid ? { [uuid]: info } : {}));
        }
        // Is this someone who is a contact, or are we sharing our profile with them?
        //   Or is the person who added us to this group a contact or are we sharing profile
        //   with them?
        isFromOrAddedByTrustedContact() {
            if (this.isPrivate()) {
                return Boolean(this.get('name')) || this.get('profileSharing');
            }
            const addedBy = this.get('addedBy');
            if (!addedBy) {
                return false;
            }
            const conv = window.ConversationController.get(addedBy);
            if (!conv) {
                return false;
            }
            return Boolean(conv.get('name')) || conv.get('profileSharing');
        }
        async updateLastMessage() {
            if (!this.id) {
                return;
            }
            const [previewMessage, activityMessage] = await Promise.all([
                window.Signal.Data.getLastConversationPreview(this.id, {
                    Message: window.Whisper.Message,
                }),
                window.Signal.Data.getLastConversationActivity(this.id, {
                    Message: window.Whisper.Message,
                }),
            ]);
            if (this.hasDraft() &&
                this.get('draftTimestamp') &&
                (!previewMessage ||
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    previewMessage.get('sent_at') < this.get('draftTimestamp'))) {
                return;
            }
            const currentTimestamp = this.get('timestamp') || null;
            const timestamp = activityMessage
                ? activityMessage.get('sent_at') ||
                activityMessage.get('received_at') ||
                currentTimestamp
                : currentTimestamp;
            this.set({
                lastMessage: (previewMessage ? previewMessage.getNotificationText() : '') || '',
                lastMessageStatus: (previewMessage ? previewMessage.getMessagePropStatus() : null) || null,
                timestamp,
                lastMessageDeletedForEveryone: previewMessage
                    ? previewMessage.deletedForEveryone
                    : false,
            });
            window.Signal.Data.updateConversation(this.attributes);
        }
        setArchived(isArchived) {
            const before = this.get('isArchived');
            this.set({ isArchived });
            window.Signal.Data.updateConversation(this.attributes);
            const after = this.get('isArchived');
            if (Boolean(before) !== Boolean(after)) {
                this.captureChange();
            }
        }
        async updateExpirationTimerInGroupV2(seconds) {
            // Make change on the server
            const actions = window.Signal.Groups.buildDisappearingMessagesTimerChange({
                expireTimer: seconds || 0,
                group: this.attributes,
            });
            let signedGroupChange;
            try {
                signedGroupChange = await window.Signal.Groups.uploadGroupChange({
                    actions,
                    group: this.attributes,
                    serverPublicParamsBase64: window.getServerPublicParams(),
                });
            }
            catch (error) {
                // Get latest GroupV2 data, since we ran into trouble updating it
                this.fetchLatestGroupV2Data();
                throw error;
            }
            // Update local conversation
            this.set({
                expireTimer: seconds || 0,
                revision: actions.version,
            });
            window.Signal.Data.updateConversation(this.attributes);
            // Create local notification
            const timestamp = Date.now();
            const id = window.getGuid();
            const message = window.MessageController.register(id, new window.Whisper.Message({
                id,
                conversationId: this.id,
                sent_at: timestamp,
                received_at: timestamp,
                flags: window.textsecure.protobuf.DataMessage.Flags.EXPIRATION_TIMER_UPDATE,
                expirationTimerUpdate: {
                    expireTimer: seconds,
                    sourceUuid: this.ourUuid,
                },
            }));
            await window.Signal.Data.saveMessage(message.attributes, {
                Message: window.Whisper.Message,
                forceSave: true,
            });
            this.trigger('newmessage', message);
            // Send message to all group members
            const profileKey = this.get('profileSharing')
                ? window.storage.get('profileKey')
                : undefined;
            const sendOptions = this.getSendOptions();
            const promise = window.textsecure.messaging.sendMessageToGroup({
                groupV2: this.getGroupV2Info(signedGroupChange.toArrayBuffer()),
                timestamp,
                profileKey,
            }, sendOptions);
            message.send(promise);
        }
        async updateExpirationTimer(providedExpireTimer, providedSource, receivedAt, options = {}) {
            if (this.get('groupVersion') === 2) {
                if (providedSource || receivedAt) {
                    throw new Error('updateExpirationTimer: GroupV2 timers are not updated this way');
                }
                await this.updateExpirationTimerInGroupV2(providedExpireTimer);
                return false;
            }
            let expireTimer = providedExpireTimer;
            let source = providedSource;
            if (this.get('left')) {
                return false;
            }
            window._.defaults(options, { fromSync: false, fromGroupUpdate: false });
            if (!expireTimer) {
                expireTimer = undefined;
            }
            if (this.get('expireTimer') === expireTimer ||
                (!expireTimer && !this.get('expireTimer'))) {
                return null;
            }
            window.log.info("Update conversation 'expireTimer'", {
                id: this.idForLogging(),
                expireTimer,
                source,
            });
            source = source || window.ConversationController.getOurConversationId();
            // When we add a disappearing messages notification to the conversation, we want it
            //   to be above the message that initiated that change, hence the subtraction.
            const timestamp = (receivedAt || Date.now()) - 1;
            this.set({ expireTimer });
            window.Signal.Data.updateConversation(this.attributes);
            const model = new window.Whisper.Message({
                // Even though this isn't reflected to the user, we want to place the last seen
                //   indicator above it. We set it to 'unread' to trigger that placement.
                unread: 1,
                conversationId: this.id,
                // No type; 'incoming' messages are specially treated by conversation.markRead()
                sent_at: timestamp,
                received_at: timestamp,
                flags: window.textsecure.protobuf.DataMessage.Flags.EXPIRATION_TIMER_UPDATE,
                expirationTimerUpdate: {
                    expireTimer,
                    source,
                    fromSync: options.fromSync,
                    fromGroupUpdate: options.fromGroupUpdate,
                },
            });
            if (this.isPrivate()) {
                model.set({ destination: this.getSendTarget() });
            }
            if (model.isOutgoing()) {
                model.set({ recipients: this.getRecipients() });
            }
            const id = await window.Signal.Data.saveMessage(model.attributes, {
                Message: window.Whisper.Message,
            });
            model.set({ id });
            const message = window.MessageController.register(id, model);
            this.addSingleMessage(message);
            // if change was made remotely, don't send it to the number/group
            if (receivedAt) {
                return message;
            }
            let profileKey;
            if (this.get('profileSharing')) {
                profileKey = window.storage.get('profileKey');
            }
            const sendOptions = this.getSendOptions();
            let promise;
            if (this.isMe()) {
                const flags = window.textsecure.protobuf.DataMessage.Flags.EXPIRATION_TIMER_UPDATE;
                const dataMessage = await window.textsecure.messaging.getMessageProto(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.getSendTarget(), undefined, // body
                    [], // attachments
                    undefined, // quote
                    [], // preview
                    undefined, // sticker
                    undefined, // reaction
                    message.get('sent_at'), expireTimer, profileKey, flags);
                return message.sendSyncMessageOnly(dataMessage);
            }
            if (this.get('type') === 'private') {
                promise = window.textsecure.messaging.sendExpirationTimerUpdateToIdentifier(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.getSendTarget(), expireTimer, message.get('sent_at'), profileKey, sendOptions);
            }
            else {
                promise = window.textsecure.messaging.sendExpirationTimerUpdateToGroup(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('groupId'), this.getRecipients(), expireTimer, message.get('sent_at'), profileKey, sendOptions);
            }
            await message.send(this.wrapSend(promise));
            return message;
        }
        async addMessageHistoryDisclaimer() {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const lastMessage = this.messageCollection.last();
            if (lastMessage && lastMessage.get('type') === 'message-history-unsynced') {
                // We do not need another message history disclaimer
                return lastMessage;
            }
            const timestamp = Date.now();
            const model = new window.Whisper.Message({
                type: 'message-history-unsynced',
                // Even though this isn't reflected to the user, we want to place the last seen
                //   indicator above it. We set it to 'unread' to trigger that placement.
                unread: 1,
                conversationId: this.id,
                // No type; 'incoming' messages are specially treated by conversation.markRead()
                sent_at: timestamp,
                received_at: timestamp,
            });
            if (this.isPrivate()) {
                model.set({ destination: this.id });
            }
            if (model.isOutgoing()) {
                model.set({ recipients: this.getRecipients() });
            }
            const id = await window.Signal.Data.saveMessage(model.attributes, {
                Message: window.Whisper.Message,
            });
            model.set({ id });
            const message = window.MessageController.register(id, model);
            this.addSingleMessage(message);
            return message;
        }
        isSearchable() {
            return !this.get('left');
        }
        async endSession() {
            if (this.isPrivate()) {
                const now = Date.now();
                const model = new window.Whisper.Message({
                    conversationId: this.id,
                    type: 'outgoing',
                    sent_at: now,
                    received_at: now,
                    destination: this.get('e164'),
                    destinationUuid: this.get('uuid'),
                    recipients: this.getRecipients(),
                    flags: window.textsecure.protobuf.DataMessage.Flags.END_SESSION,
                });
                const id = await window.Signal.Data.saveMessage(model.attributes, {
                    Message: window.Whisper.Message,
                });
                model.set({ id });
                const message = window.MessageController.register(model.id, model);
                this.addSingleMessage(message);
                const options = this.getSendOptions();
                message.send(this.wrapSend(
                    // TODO: DESKTOP-724
                    // resetSession returns `Array<void>` which is incompatible with the
                    // expected promise return values. `[]` is truthy and wrapSend assumes
                    // it's a valid callback result type
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    window.textsecure.messaging.resetSession(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.get('uuid'),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this.get('e164'), now, options)));
            }
        }
        async markRead(newestUnreadDate, providedOptions) {
            const options = providedOptions || {};
            window._.defaults(options, { sendReadReceipts: true });
            const conversationId = this.id;
            window.Whisper.Notifications.removeBy({ conversationId });
            let unreadMessages = await this.getUnread();
            const oldUnread = unreadMessages.filter(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                message => message.get('received_at') <= newestUnreadDate);
            let read = await Promise.all(window._.map(oldUnread, async (providedM) => {
                const m = window.MessageController.register(providedM.id, providedM);
                // Note that this will update the message in the database
                await m.markRead(options.readAt);
                return {
                    senderE164: m.get('source'),
                    senderUuid: m.get('sourceUuid'),
                    senderId: window.ConversationController.ensureContactIds({
                        e164: m.get('source'),
                        uuid: m.get('sourceUuid'),
                    }),
                    timestamp: m.get('sent_at'),
                    hasErrors: m.hasErrors(),
                };
            }));
            // Some messages we're marking read are local notifications with no sender
            read = window._.filter(read, m => Boolean(m.senderId));
            unreadMessages = unreadMessages.filter(m => Boolean(m.isIncoming()));
            const unreadCount = unreadMessages.length - read.length;
            this.set({ unreadCount });
            window.Signal.Data.updateConversation(this.attributes);
            // If a message has errors, we don't want to send anything out about it.
            //   read syncs - let's wait for a client that really understands the message
            //      to mark it read. we'll mark our local error read locally, though.
            //   read receipts - here we can run into infinite loops, where each time the
            //      conversation is viewed, another error message shows up for the contact
            read = read.filter(item => !item.hasErrors);
            if (read.length && options.sendReadReceipts) {
                window.log.info(`Sending ${read.length} read syncs`);
                // Because syncReadMessages sends to our other devices, and sendReadReceipts goes
                //   to a contact, we need accessKeys for both.
                const { sendOptions, } = window.ConversationController.prepareForSend(window.ConversationController.getOurConversationId(), { syncMessage: true });
                await this.wrapSend(window.textsecure.messaging.syncReadMessages(read, sendOptions));
                await this.sendReadReceiptsFor(read);
            }
        }
        async sendReadReceiptsFor(items) {
            // Only send read receipts for accepted conversations
            if (window.storage.get('read-receipt-setting') && this.getAccepted()) {
                window.log.info(`Sending ${items.length} read receipts`);
                const convoSendOptions = this.getSendOptions();
                const receiptsBySender = window._.groupBy(items, 'senderId');
                await Promise.all(window._.map(receiptsBySender, async (receipts, senderId) => {
                    const timestamps = window._.map(receipts, 'timestamp');
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    const c = window.ConversationController.get(senderId);
                    await this.wrapSend(window.textsecure.messaging.sendReadReceipts(
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c.get('e164'),
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        c.get('uuid'), timestamps, convoSendOptions));
                }));
            }
        }
        // This is an expensive operation we use to populate the message request hero row. It
        //   shows groups the current user has in common with this potential new contact.
        async updateSharedGroups() {
            if (!this.isPrivate()) {
                return;
            }
            if (this.isMe()) {
                return;
            }
            const ourGroups = await window.ConversationController.getAllGroupsInvolvingId(
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                window.ConversationController.getOurConversationId());
            const theirGroups = await window.ConversationController.getAllGroupsInvolvingId(this.id);
            const sharedGroups = window._.intersection(ourGroups, theirGroups);
            const sharedGroupNames = sharedGroups.map(conversation => conversation.getTitle());
            this.set({ sharedGroupNames });
        }
        onChangeProfileKey() {
            if (this.isPrivate()) {
                this.getProfiles();
            }
        }
        getProfiles() {
            // request all conversation members' keys
            const conversations = this.getMembers();
            return Promise.all(window._.map(conversations, conversation => {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.getProfile(conversation.get('uuid'), conversation.get('e164'));
            }));
        }
        async getProfile(providedUuid, providedE164) {
            if (!window.textsecure.messaging) {
                throw new Error('Conversation.getProfile: window.textsecure.messaging not available');
            }
            const id = window.ConversationController.ensureContactIds({
                uuid: providedUuid,
                e164: providedE164,
            });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const c = window.ConversationController.get(id);
            const { generateProfileKeyCredentialRequest, getClientZkProfileOperations, handleProfileKeyCredential, } = Util.zkgroup;
            const clientZkProfileCipher = getClientZkProfileOperations(window.getServerPublicParams());
            let profile;
            try {
                await Promise.all([
                    c.deriveAccessKeyIfNeeded(),
                    c.deriveProfileKeyVersionIfNeeded(),
                ]);
                const profileKey = c.get('profileKey');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const uuid = c.get('uuid');
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const identifier = c.getSendTarget();
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const profileKeyVersionHex = c.get('profileKeyVersion');
                const existingProfileKeyCredential = c.get('profileKeyCredential');
                const weHaveVersion = Boolean(profileKey && uuid && profileKeyVersionHex);
                let profileKeyCredentialRequestHex;
                let profileCredentialRequestContext;
                if (weHaveVersion && !existingProfileKeyCredential) {
                    window.log.info('Generating request...');
                    ({
                        requestHex: profileKeyCredentialRequestHex,
                        context: profileCredentialRequestContext,
                    } = generateProfileKeyCredentialRequest(clientZkProfileCipher, uuid, profileKey));
                }
                const sendMetadata = c.getSendMetadata({ disableMeCheck: true }) || {};
                const getInfo =
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    sendMetadata[c.get('uuid')] || sendMetadata[c.get('e164')] || {};
                if (getInfo.accessKey) {
                    try {
                        profile = await window.textsecure.messaging.getProfile(identifier, {
                            accessKey: getInfo.accessKey,
                            profileKeyVersion: profileKeyVersionHex,
                            profileKeyCredentialRequest: profileKeyCredentialRequestHex,
                        });
                    }
                    catch (error) {
                        if (error.code === 401 || error.code === 403) {
                            window.log.info(`Setting sealedSender to DISABLED for conversation ${c.idForLogging()}`);
                            c.set({ sealedSender: SEALED_SENDER.DISABLED });
                            profile = await window.textsecure.messaging.getProfile(identifier, {
                                profileKeyVersion: profileKeyVersionHex,
                                profileKeyCredentialRequest: profileKeyCredentialRequestHex,
                            });
                        }
                        else {
                            throw error;
                        }
                    }
                }
                else {
                    profile = await window.textsecure.messaging.getProfile(identifier, {
                        profileKeyVersion: profileKeyVersionHex,
                        profileKeyCredentialRequest: profileKeyCredentialRequestHex,
                    });
                }
                const identityKey = base64ToArrayBuffer(profile.identityKey);
                const changed = await window.textsecure.storage.protocol.saveIdentity(`${identifier}.1`, identityKey, false);
                if (changed) {
                    // save identity will close all sessions except for .1, so we
                    // must close that one manually.
                    const address = new window.libsignal.SignalProtocolAddress(identifier, 1);
                    window.log.info('closing session for', address.toString());
                    const sessionCipher = new window.libsignal.SessionCipher(window.textsecure.storage.protocol, address);
                    await sessionCipher.closeOpenSessionForDevice();
                }
                const accessKey = c.get('accessKey');
                if (profile.unrestrictedUnidentifiedAccess &&
                    profile.unidentifiedAccess) {
                    window.log.info(`Setting sealedSender to UNRESTRICTED for conversation ${c.idForLogging()}`);
                    c.set({
                        sealedSender: SEALED_SENDER.UNRESTRICTED,
                    });
                }
                else if (accessKey && profile.unidentifiedAccess) {
                    const haveCorrectKey = await verifyAccessKey(base64ToArrayBuffer(accessKey), base64ToArrayBuffer(profile.unidentifiedAccess));
                    if (haveCorrectKey) {
                        window.log.info(`Setting sealedSender to ENABLED for conversation ${c.idForLogging()}`);
                        c.set({
                            sealedSender: SEALED_SENDER.ENABLED,
                        });
                    }
                    else {
                        window.log.info(`Setting sealedSender to DISABLED for conversation ${c.idForLogging()}`);
                        c.set({
                            sealedSender: SEALED_SENDER.DISABLED,
                        });
                    }
                }
                else {
                    window.log.info(`Setting sealedSender to DISABLED for conversation ${c.idForLogging()}`);
                    c.set({
                        sealedSender: SEALED_SENDER.DISABLED,
                    });
                }
                if (profile.capabilities) {
                    c.set({ capabilities: profile.capabilities });
                }
                if (profileCredentialRequestContext && profile.credential) {
                    const profileKeyCredential = handleProfileKeyCredential(clientZkProfileCipher, profileCredentialRequestContext, profile.credential);
                    c.set({ profileKeyCredential });
                }
            }
            catch (error) {
                if (error.code !== 403 && error.code !== 404) {
                    window.log.warn('getProfile failure:', c.idForLogging(), error && error.stack ? error.stack : error);
                }
                else {
                    await c.dropProfileKey();
                }
                return;
            }
            try {
                await c.setEncryptedProfileName(profile.name);
            }
            catch (error) {
                window.log.warn('getProfile decryption failure:', c.idForLogging(), error && error.stack ? error.stack : error);
                await c.dropProfileKey();
            }
            try {
                await c.setProfileAvatar(profile.avatar);
            }
            catch (error) {
                if (error.code === 403 || error.code === 404) {
                    window.log.info(`Clearing profile avatar for conversation ${c.idForLogging()}`);
                    c.set({
                        profileAvatar: null,
                    });
                }
            }
            window.Signal.Data.updateConversation(c.attributes);
        }
        async setEncryptedProfileName(encryptedName) {
            if (!encryptedName) {
                return;
            }
            // isn't this already an ArrayBuffer?
            const key = this.get('profileKey');
            if (!key) {
                return;
            }
            // decode
            const keyBuffer = base64ToArrayBuffer(key);
            // decrypt
            const { given, family } = await window.textsecure.crypto.decryptProfileName(encryptedName, keyBuffer);
            // encode
            const profileName = given ? stringFromBytes(given) : undefined;
            const profileFamilyName = family ? stringFromBytes(family) : undefined;
            // set then check for changes
            const oldName = this.getProfileName();
            const hadPreviousName = Boolean(oldName);
            this.set({ profileName, profileFamilyName });
            const newName = this.getProfileName();
            // Note that we compare the combined names to ensure that we don't present the exact
            //   same before/after string, even if someone is moving from just first name to
            //   first/last name in their profile data.
            const nameChanged = oldName !== newName;
            if (!this.isMe() && hadPreviousName && nameChanged) {
                const change = {
                    type: 'name',
                    oldName,
                    newName,
                };
                await this.addProfileChange(change);
            }
        }
        async setProfileAvatar(avatarPath) {
            if (!avatarPath) {
                return;
            }
            if (this.isMe()) {
                window.storage.put('avatarUrl', avatarPath);
            }
            const avatar = await window.textsecure.messaging.getAvatar(avatarPath);
            // isn't this already an ArrayBuffer?
            const key = this.get('profileKey');
            if (!key) {
                return;
            }
            const keyBuffer = base64ToArrayBuffer(key);
            // decrypt
            const decrypted = await window.textsecure.crypto.decryptProfile(avatar, keyBuffer);
            // update the conversation avatar only if hash differs
            if (decrypted) {
                const newAttributes = await window.Signal.Types.Conversation.maybeUpdateProfileAvatar(this.attributes, decrypted, {
                    writeNewAttachmentData,
                    deleteAttachmentData,
                    doesAttachmentExist,
                });
                this.set(newAttributes);
            }
        }
        async setProfileKey(profileKey, { viaStorageServiceSync = false } = {}) {
            // profileKey is a string so we can compare it directly
            if (this.get('profileKey') !== profileKey) {
                window.log.info(`Setting sealedSender to UNKNOWN for conversation ${this.idForLogging()}`);
                this.set({
                    profileKey,
                    profileKeyVersion: undefined,
                    profileKeyCredential: null,
                    accessKey: null,
                    sealedSender: SEALED_SENDER.UNKNOWN,
                });
                if (!viaStorageServiceSync) {
                    this.captureChange();
                }
                await Promise.all([
                    this.deriveAccessKeyIfNeeded(),
                    this.deriveProfileKeyVersionIfNeeded(),
                ]);
                window.Signal.Data.updateConversation(this.attributes, {
                    Conversation: window.Whisper.Conversation,
                });
            }
        }
        async dropProfileKey() {
            if (this.get('profileKey')) {
                window.log.info(`Dropping profileKey, setting sealedSender to UNKNOWN for conversation ${this.idForLogging()}`);
                const profileAvatar = this.get('profileAvatar');
                if (profileAvatar && profileAvatar.path) {
                    await deleteAttachmentData(profileAvatar.path);
                }
                this.set({
                    profileKey: undefined,
                    profileKeyVersion: undefined,
                    profileKeyCredential: null,
                    accessKey: null,
                    profileName: undefined,
                    profileFamilyName: undefined,
                    profileAvatar: null,
                    sealedSender: SEALED_SENDER.UNKNOWN,
                });
                window.Signal.Data.updateConversation(this.attributes);
            }
        }
        async deriveAccessKeyIfNeeded() {
            // isn't this already an array buffer?
            const profileKey = this.get('profileKey');
            if (!profileKey) {
                return;
            }
            if (this.get('accessKey')) {
                return;
            }
            const profileKeyBuffer = base64ToArrayBuffer(profileKey);
            const accessKeyBuffer = await deriveAccessKey(profileKeyBuffer);
            const accessKey = arrayBufferToBase64(accessKeyBuffer);
            this.set({ accessKey });
        }
        async deriveProfileKeyVersionIfNeeded() {
            const profileKey = this.get('profileKey');
            if (!profileKey) {
                return;
            }
            const uuid = this.get('uuid');
            if (!uuid || this.get('profileKeyVersion')) {
                return;
            }
            const profileKeyVersion = Util.zkgroup.deriveProfileKeyVersion(profileKey, uuid);
            this.set({ profileKeyVersion });
        }
        hasMember(identifier) {
            const id = window.ConversationController.getConversationId(identifier);
            const memberIds = this.getMemberIds();
            return window._.contains(memberIds, id);
        }
        fetchContacts() {
            if (this.isPrivate()) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.contactCollection.reset([this]);
            }
            const members = this.getMembers();
            window._.forEach(members, member => {
                this.listenTo(member, 'change:verified', this.onMemberVerifiedChange);
            });
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.contactCollection.reset(members);
        }
        async destroyMessages() {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.messageCollection.reset([]);
            this.set({
                lastMessage: null,
                timestamp: null,
                active_at: null,
            });
            window.Signal.Data.updateConversation(this.attributes);
            await window.Signal.Data.removeAllMessagesInConversation(this.id, {
                MessageCollection: window.Whisper.MessageCollection,
            });
        }
        getTitle() {
            if (this.isPrivate()) {
                return (this.get('name') ||
                    this.getProfileName() ||
                    this.getNumber() ||
                    window.i18n('unknownContact'));
            }
            return this.get('name') || window.i18n('unknownGroup');
        }
        getProfileName() {
            if (this.isPrivate()) {
                return Util.combineNames(
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.get('profileName'), this.get('profileFamilyName'));
            }
            return null;
        }
        getNumber() {
            if (!this.isPrivate()) {
                return '';
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const number = this.get('e164');
            try {
                const parsedNumber = window.libphonenumber.parse(number);
                const regionCode = window.libphonenumber.getRegionCodeForNumber(parsedNumber);
                if (regionCode === window.storage.get('regionCode')) {
                    return window.libphonenumber.format(parsedNumber, window.libphonenumber.PhoneNumberFormat.NATIONAL);
                }
                return window.libphonenumber.format(parsedNumber, window.libphonenumber.PhoneNumberFormat.INTERNATIONAL);
            }
            catch (e) {
                return number;
            }
        }
        getInitials(name) {
            if (!name) {
                return null;
            }
            const cleaned = name.replace(/[^A-Za-z\s]+/g, '').replace(/\s+/g, ' ');
            const parts = cleaned.split(' ');
            const initials = parts.map(part => part.trim()[0]);
            if (!initials.length) {
                return null;
            }
            return initials.slice(0, 2).join('');
        }
        isPrivate() {
            return this.get('type') === 'private';
        }
        getColor() {
            if (!this.isPrivate()) {
                return 'signal-blue';
            }
            const { migrateColor } = Util;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return migrateColor(this.get('color'));
        }
        getAvatarPath() {
            const avatar = this.isMe()
                ? this.get('profileAvatar') || this.get('avatar')
                : this.get('avatar') || this.get('profileAvatar');
            if (avatar && avatar.path) {
                return getAbsoluteAttachmentPath(avatar.path);
            }
            return null;
        }
        canChangeTimer() {
            if (this.isPrivate()) {
                return true;
            }
            if (this.get('groupVersion') !== 2) {
                return true;
            }
            const accessControlEnum = window.textsecure.protobuf.AccessControl.AccessRequired;
            const accessControl = this.get('accessControl');
            const canAnyoneChangeTimer = accessControl &&
                (accessControl.attributes === accessControlEnum.ANY ||
                    accessControl.attributes === accessControlEnum.MEMBER);
            if (canAnyoneChangeTimer) {
                return true;
            }
            const memberEnum = window.textsecure.protobuf.Member.Role;
            const members = this.get('membersV2') || [];
            const myId = window.ConversationController.getOurConversationId();
            const me = members.find(item => item.conversationId === myId);
            if (!me) {
                return false;
            }
            const isAdministrator = me.role === memberEnum.ADMINISTRATOR;
            if (isAdministrator) {
                return true;
            }
            return false;
        }
        // Set of items to captureChanges on:
        // [-] uuid
        // [-] e164
        // [X] profileKey
        // [-] identityKey
        // [X] verified!
        // [-] profileName
        // [-] profileFamilyName
        // [X] blocked
        // [X] whitelisted
        // [X] archived
        captureChange() {
            if (!window.Signal.RemoteConfig.isEnabled('desktop.storageWrite')) {
                window.log.info('conversation.captureChange: Returning early; desktop.storageWrite is falsey');
                return;
            }
            window.log.info(`storageService[captureChange] marking ${this.debugID()} as needing sync`);
            this.set({ needsStorageServiceSync: true });
            this.queueJob(() => {
                Services.storageServiceUploadJob();
            });
        }
        isMuted() {
            return (this.get('muteExpiresAt') &&
                Date.now() < this.get('muteExpiresAt'));
        }
        async notify(message, reaction) {
            if (this.isMuted()) {
                return;
            }
            if (!message.isIncoming() && !reaction) {
                return;
            }
            const conversationId = this.id;
            const sender = reaction
                ? window.ConversationController.get(reaction.get('fromId'))
                : message.getContact();
            const senderName = sender
                ? sender.getTitle()
                : window.i18n('unknownContact');
            const senderTitle = this.isPrivate()
                ? senderName
                : window.i18n('notificationSenderInGroup', {
                    sender: senderName,
                    group: this.getTitle(),
                });
            let notificationIconUrl;
            const avatar = this.get('avatar') || this.get('profileAvatar');
            if (avatar && avatar.path) {
                notificationIconUrl = getAbsoluteAttachmentPath(avatar.path);
            }
            else if (this.isPrivate()) {
                notificationIconUrl = await new window.Whisper.IdenticonSVGView({
                    color: this.getColor(),
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    content: this.getInitials(this.get('name')) || '#',
                }).getDataUrl();
            }
            else {
                // Not technically needed, but helps us be explicit: we don't show an icon for a
                //   group that doesn't have an icon.
                notificationIconUrl = undefined;
            }
            const messageJSON = message.toJSON();
            const messageId = message.id;
            const isExpiringMessage = Message.hasExpiration(messageJSON);
            window.Whisper.Notifications.add({
                senderTitle,
                conversationId,
                notificationIconUrl,
                isExpiringMessage,
                message: message.getNotificationText(),
                messageId,
                reaction: reaction ? reaction.toJSON() : null,
            });
        }
        notifyTyping(options = {}) {
            const { isTyping, senderId, isMe, senderDevice } = options;
            // We don't do anything with typing messages from our other devices
            if (isMe) {
                return;
            }
            const typingToken = `${senderId}.${senderDevice}`;
            this.contactTypingTimers = this.contactTypingTimers || {};
            const record = this.contactTypingTimers[typingToken];
            if (record) {
                clearTimeout(record.timer);
            }
            if (isTyping) {
                this.contactTypingTimers[typingToken] = this.contactTypingTimers[typingToken] || {
                    timestamp: Date.now(),
                    senderId,
                    senderDevice,
                };
                this.contactTypingTimers[typingToken].timer = setTimeout(this.clearContactTypingTimer.bind(this, typingToken), 15 * 1000);
                if (!record) {
                    // User was not previously typing before. State change!
                    this.trigger('change', this);
                }
            }
            else {
                delete this.contactTypingTimers[typingToken];
                if (record) {
                    // User was previously typing, and is no longer. State change!
                    this.trigger('change', this);
                }
            }
        }
        clearContactTypingTimer(typingToken) {
            this.contactTypingTimers = this.contactTypingTimers || {};
            const record = this.contactTypingTimers[typingToken];
            if (record) {
                clearTimeout(record.timer);
                delete this.contactTypingTimers[typingToken];
                // User was previously typing, but timed out or we received message. State change!
                this.trigger('change', this);
            }
        }
        getName() {
            // eslint-disable-next-line no-useless-return
            return;
        }
    }
    exports.ConversationModel = ConversationModel;
    window.Whisper.Conversation = ConversationModel;
    window.Whisper.ConversationCollection = window.Backbone.Collection.extend({
        model: window.Whisper.Conversation,
        /**
         * window.Backbone defines a `_byId` field. Here we set up additional `_byE164`,
         * `_byUuid`, and `_byGroupId` fields so we can track conversations by more
         * than just their id.
         */
        initialize() {
            this.eraseLookups();
            this.on('idUpdated', (model, idProp, oldValue) => {
                if (oldValue) {
                    if (idProp === 'e164') {
                        delete this._byE164[oldValue];
                    }
                    if (idProp === 'uuid') {
                        delete this._byUuid[oldValue];
                    }
                    if (idProp === 'groupId') {
                        delete this._byGroupid[oldValue];
                    }
                }
                if (model.get('e164')) {
                    this._byE164[model.get('e164')] = model;
                }
                if (model.get('uuid')) {
                    this._byUuid[model.get('uuid')] = model;
                }
                if (model.get('groupId')) {
                    this._byGroupid[model.get('groupId')] = model;
                }
            });
        },
        reset(...args) {
            window.Backbone.Collection.prototype.reset.apply(this, args);
            this.resetLookups();
        },
        resetLookups() {
            this.eraseLookups();
            this.generateLookups(this.models);
        },
        generateLookups(models) {
            models.forEach(model => {
                const e164 = model.get('e164');
                if (e164) {
                    const existing = this._byE164[e164];
                    // Prefer the contact with both e164 and uuid
                    if (!existing || (existing && !existing.get('uuid'))) {
                        this._byE164[e164] = model;
                    }
                }
                const uuid = model.get('uuid');
                if (uuid) {
                    const existing = this._byUuid[uuid];
                    // Prefer the contact with both e164 and uuid
                    if (!existing || (existing && !existing.get('e164'))) {
                        this._byUuid[uuid] = model;
                    }
                }
                const groupId = model.get('groupId');
                if (groupId) {
                    this._byGroupId[groupId] = model;
                }
            });
        },
        eraseLookups() {
            this._byE164 = Object.create(null);
            this._byUuid = Object.create(null);
            this._byGroupId = Object.create(null);
        },
        add(...models) {
            const result = window.Backbone.Collection.prototype.add.apply(this, models);
            this.generateLookups(Array.isArray(result) ? result.slice(0) : [result]);
            return result;
        },
        /**
         * window.Backbone collections have a `_byId` field that `get` defers to. Here, we
         * override `get` to first access our custom `_byE164`, `_byUuid`, and
         * `_byGroupId` functions, followed by falling back to the original
         * window.Backbone implementation.
         */
        get(id) {
            return (this._byE164[id] ||
                this._byE164[`+${id}`] ||
                this._byUuid[id] ||
                this._byGroupId[id] ||
                window.Backbone.Collection.prototype.get.call(this, id));
        },
        comparator(m) {
            return -m.get('timestamp');
        },
    });
    window.Whisper.Conversation.COLORS = COLORS.concat(['grey', 'default']).join(' ');
    // This is a wrapper model used to display group members in the member list view, within
    //   the world of backbone, but layering another bit of group-specific data top of base
    //   conversation data.
    window.Whisper.GroupMemberConversation = window.Backbone.Model.extend({
        initialize(attributes) {
            const { conversation, isAdmin } = attributes;
            if (!conversation) {
                throw new Error('GroupMemberConversation.initialze: conversation required!');
            }
            if (!window._.isBoolean(isAdmin)) {
                throw new Error('GroupMemberConversation.initialze: isAdmin required!');
            }
            // If our underlying conversation changes, we change too
            this.listenTo(conversation, 'change', () => {
                this.trigger('change', this);
            });
            this.conversation = conversation;
            this.isAdmin = isAdmin;
        },
        format() {
            return Object.assign(Object.assign({}, this.conversation.format()), { isAdmin: this.isAdmin });
        },
        get(...params) {
            return this.conversation.get(...params);
        },
        getTitle() {
            return this.conversation.getTitle();
        },
        isMe() {
            return this.conversation.isMe();
        },
    });
    // We need a custom collection here to get the sorting we need
    window.Whisper.GroupConversationCollection = window.Backbone.Collection.extend({
        model: window.Whisper.GroupMemberConversation,
        initialize() {
            this.collator = new Intl.Collator();
        },
        comparator(left, right) {
            if (left.isAdmin && !right.isAdmin) {
                return -1;
            }
            if (!left.isAdmin && right.isAdmin) {
                return 1;
            }
            const leftLower = left.getTitle().toLowerCase();
            const rightLower = right.getTitle().toLowerCase();
            return this.collator.compare(leftLower, rightLower);
        },
    });
});