(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.OutgoingMessage = {};

    // tslint:disable no-default-export
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const Errors_1 = window.ts.textsecure.Errors;
    class OutgoingMessage {
        constructor(server, timestamp, identifiers, message, silent, callback, options = {}) {
            if (message instanceof window.textsecure.protobuf.DataMessage) {
                const content = new window.textsecure.protobuf.Content();
                content.dataMessage = message;
                // eslint-disable-next-line no-param-reassign
                this.message = content;
            }
            else {
                this.message = message;
            }
            this.server = server;
            this.timestamp = timestamp;
            this.identifiers = identifiers;
            this.callback = callback;
            this.silent = silent;
            this.identifiersCompleted = 0;
            this.errors = [];
            this.successfulIdentifiers = [];
            this.failoverIdentifiers = [];
            this.unidentifiedDeliveries = [];
            const { sendMetadata, senderCertificate, online } = options || {};
            this.sendMetadata = sendMetadata;
            this.senderCertificate = senderCertificate;
            this.online = online;
        }
        numberCompleted() {
            this.identifiersCompleted += 1;
            if (this.identifiersCompleted >= this.identifiers.length) {
                this.callback({
                    successfulIdentifiers: this.successfulIdentifiers,
                    failoverIdentifiers: this.failoverIdentifiers,
                    errors: this.errors,
                    unidentifiedDeliveries: this.unidentifiedDeliveries,
                });
            }
        }
        registerError(identifier, reason, error) {
            if (!error || (error.name === 'HTTPError' && error.code !== 404)) {
                // tslint:disable-next-line no-parameter-reassignment
                error = new Errors_1.OutgoingMessageError(identifier, this.message.toArrayBuffer(), this.timestamp, error);
            }
            // eslint-disable-next-line no-param-reassign
            error.reason = reason;
            this.errors[this.errors.length] = error;
            this.numberCompleted();
        }
        reloadDevicesAndSend(identifier, recurse) {
            return async () => window.textsecure.storage.protocol
                .getDeviceIds(identifier)
                .then(async (deviceIds) => {
                    if (deviceIds.length === 0) {
                        this.registerError(identifier, 'Got empty device list when loading device keys', undefined);
                        return;
                    }
                    return this.doSendMessage(identifier, deviceIds, recurse);
                });
        }
        // tslint:disable-next-line max-func-body-length
        async getKeysForIdentifier(identifier, updateDevices) {
            const handleResult = async (response) => Promise.all(response.devices.map(async (device) => {
                if (updateDevices === undefined ||
                    updateDevices.indexOf(device.deviceId) > -1) {
                    const address = new window.libsignal.SignalProtocolAddress(identifier, device.deviceId);
                    const builder = new window.libsignal.SessionBuilder(window.textsecure.storage.protocol, address);
                    if (device.registrationId === 0) {
                        window.log.info('device registrationId 0!');
                    }
                    const deviceForProcess = Object.assign(Object.assign({}, device), { identityKey: response.identityKey });
                    return builder.processPreKey(deviceForProcess).catch(error => {
                        if (error.message === 'Identity key changed') {
                            error.timestamp = this.timestamp;
                            error.originalMessage = this.message.toArrayBuffer();
                            error.identityKey = response.identityKey;
                        }
                        throw error;
                    });
                }
                return null;
            }));
            const { sendMetadata } = this;
            const info = sendMetadata && sendMetadata[identifier]
                ? sendMetadata[identifier]
                : { accessKey: undefined };
            const { accessKey } = info;
            if (updateDevices === undefined) {
                if (accessKey) {
                    return this.server
                        .getKeysForIdentifierUnauth(identifier, undefined, { accessKey })
                        .catch(async (error) => {
                            if (error.code === 401 || error.code === 403) {
                                if (this.failoverIdentifiers.indexOf(identifier) === -1) {
                                    this.failoverIdentifiers.push(identifier);
                                }
                                return this.server.getKeysForIdentifier(identifier);
                            }
                            throw error;
                        })
                        .then(handleResult);
                }
                return this.server.getKeysForIdentifier(identifier).then(handleResult);
            }
            let promise = Promise.resolve();
            updateDevices.forEach(deviceId => {
                promise = promise.then(async () => {
                    let innerPromise;
                    if (accessKey) {
                        innerPromise = this.server
                            .getKeysForIdentifierUnauth(identifier, deviceId, { accessKey })
                            .then(handleResult)
                            .catch(async (error) => {
                                if (error.code === 401 || error.code === 403) {
                                    if (this.failoverIdentifiers.indexOf(identifier) === -1) {
                                        this.failoverIdentifiers.push(identifier);
                                    }
                                    return this.server
                                        .getKeysForIdentifier(identifier, deviceId)
                                        .then(handleResult);
                                }
                                throw error;
                            });
                    }
                    else {
                        innerPromise = this.server
                            .getKeysForIdentifier(identifier, deviceId)
                            .then(handleResult);
                    }
                    return innerPromise.catch(async (e) => {
                        if (e.name === 'HTTPError' && e.code === 404) {
                            if (deviceId !== 1) {
                                return this.removeDeviceIdsForIdentifier(identifier, [deviceId]);
                            }
                            throw new Errors_1.UnregisteredUserError(identifier, e);
                        }
                        else {
                            throw e;
                        }
                    });
                });
            });
            return promise;
        }
        async transmitMessage(identifier, jsonData, timestamp, { accessKey } = {}) {
            let promise;
            if (accessKey) {
                promise = this.server.sendMessagesUnauth(identifier, jsonData, timestamp, this.silent, this.online, { accessKey });
            }
            else {
                promise = this.server.sendMessages(identifier, jsonData, timestamp, this.silent, this.online);
            }
            return promise.catch(e => {
                if (e.name === 'HTTPError' && e.code !== 409 && e.code !== 410) {
                    // 409 and 410 should bubble and be handled by doSendMessage
                    // 404 should throw UnregisteredUserError
                    // all other network errors can be retried later.
                    if (e.code === 404) {
                        throw new Errors_1.UnregisteredUserError(identifier, e);
                    }
                    throw new Errors_1.SendMessageNetworkError(identifier, jsonData, e);
                }
                throw e;
            });
        }
        getPaddedMessageLength(messageLength) {
            const messageLengthWithTerminator = messageLength + 1;
            let messagePartCount = Math.floor(messageLengthWithTerminator / 160);
            if (messageLengthWithTerminator % 160 !== 0) {
                messagePartCount += 1;
            }
            return messagePartCount * 160;
        }
        getPlaintext() {
            if (!this.plaintext) {
                const messageBuffer = this.message.toArrayBuffer();
                this.plaintext = new Uint8Array(this.getPaddedMessageLength(messageBuffer.byteLength + 1) - 1);
                this.plaintext.set(new Uint8Array(messageBuffer));
                this.plaintext[messageBuffer.byteLength] = 0x80;
            }
            return this.plaintext;
        }
        // tslint:disable-next-line max-func-body-length
        async doSendMessage(identifier, deviceIds, recurse) {
            const ciphers = {};
            const plaintext = this.getPlaintext();
            const { sendMetadata, senderCertificate } = this;
            const info = sendMetadata && sendMetadata[identifier]
                ? sendMetadata[identifier]
                : { accessKey: undefined };
            const { accessKey } = info;
            if (accessKey && !senderCertificate) {
                window.log.warn('OutgoingMessage.doSendMessage: accessKey was provided, but senderCertificate was not');
            }
            const sealedSender = Boolean(accessKey && senderCertificate);
            // We don't send to ourselves if unless sealedSender is enabled
            const ourNumber = window.textsecure.storage.user.getNumber();
            const ourUuid = window.textsecure.storage.user.getUuid();
            const ourDeviceId = window.textsecure.storage.user.getDeviceId();
            if ((identifier === ourNumber || identifier === ourUuid) && !sealedSender) {
                // tslint:disable-next-line no-parameter-reassignment
                deviceIds = lodash_1.reject(deviceIds, deviceId =>
                    // because we store our own device ID as a string at least sometimes
                    deviceId === ourDeviceId ||
                    (typeof ourDeviceId === 'string' &&
                        deviceId === parseInt(ourDeviceId, 10)));
            }
            return Promise.all(deviceIds.map(async (deviceId) => {
                const address = new window.libsignal.SignalProtocolAddress(identifier, deviceId);
                const options = {};
                // No limit on message keys if we're communicating with our other devices
                if (ourNumber === identifier || ourUuid === identifier) {
                    options.messageKeysLimit = false;
                }
                if (sealedSender) {
                    const secretSessionCipher = new window.Signal.Metadata.SecretSessionCipher(window.textsecure.storage.protocol);
                    ciphers[address.getDeviceId()] = secretSessionCipher;
                    const ciphertext = await secretSessionCipher.encrypt(address, senderCertificate, plaintext);
                    return {
                        type: window.textsecure.protobuf.Envelope.Type.UNIDENTIFIED_SENDER,
                        destinationDeviceId: address.getDeviceId(),
                        destinationRegistrationId: await secretSessionCipher.getRemoteRegistrationId(address),
                        content: window.Signal.Crypto.arrayBufferToBase64(ciphertext),
                    };
                }
                else {
                    const sessionCipher = new window.libsignal.SessionCipher(window.textsecure.storage.protocol, address, options);
                    ciphers[address.getDeviceId()] = sessionCipher;
                    const ciphertext = await sessionCipher.encrypt(plaintext);
                    return {
                        type: ciphertext.type,
                        destinationDeviceId: address.getDeviceId(),
                        destinationRegistrationId: ciphertext.registrationId,
                        content: btoa(ciphertext.body),
                    };
                }
            }))
                .then(async (jsonData) => {
                    if (sealedSender) {
                        return this.transmitMessage(identifier, jsonData, this.timestamp, {
                            accessKey,
                        }).then(() => {
                            this.unidentifiedDeliveries.push(identifier);
                            this.successfulIdentifiers.push(identifier);
                            this.numberCompleted();
                        }, async (error) => {
                            if (error.code === 401 || error.code === 403) {
                                if (this.failoverIdentifiers.indexOf(identifier) === -1) {
                                    this.failoverIdentifiers.push(identifier);
                                }
                                // This ensures that we don't hit this codepath the next time through
                                if (info) {
                                    info.accessKey = undefined;
                                }
                                return this.doSendMessage(identifier, deviceIds, recurse);
                            }
                            throw error;
                        });
                    }
                    return this.transmitMessage(identifier, jsonData, this.timestamp).then(() => {
                        this.successfulIdentifiers.push(identifier);
                        this.numberCompleted();
                    });
                })
                .catch(async (error) => {
                    if (error instanceof Error &&
                        error.name === 'HTTPError' &&
                        (error.code === 410 || error.code === 409)) {
                        if (!recurse) {
                            this.registerError(identifier, 'Hit retry limit attempting to reload device list', error);
                            return;
                        }
                        let p = Promise.resolve();
                        if (error.code === 409) {
                            p = this.removeDeviceIdsForIdentifier(identifier, error.response.extraDevices);
                        }
                        else {
                            p = Promise.all(error.response.staleDevices.map(async (deviceId) => ciphers[deviceId].closeOpenSessionForDevice(new window.libsignal.SignalProtocolAddress(identifier, deviceId))));
                        }
                        return p.then(async () => {
                            const resetDevices = error.code === 410
                                ? error.response.staleDevices
                                : error.response.missingDevices;
                            return this.getKeysForIdentifier(identifier, resetDevices).then(
                                // We continue to retry as long as the error code was 409; the assumption is
                                //   that we'll request new device info and the next request will succeed.
                                this.reloadDevicesAndSend(identifier, error.code === 409));
                        });
                    }
                    else if (error.message === 'Identity key changed') {
                        // eslint-disable-next-line no-param-reassign
                        error.timestamp = this.timestamp;
                        // eslint-disable-next-line no-param-reassign
                        error.originalMessage = this.message.toArrayBuffer();
                        window.log.error('Got "key changed" error from encrypt - no identityKey for application layer', identifier, deviceIds);
                        window.log.info('closing all sessions for', identifier);
                        const address = new window.libsignal.SignalProtocolAddress(identifier, 1);
                        const sessionCipher = new window.libsignal.SessionCipher(window.textsecure.storage.protocol, address);
                        window.log.info('closing session for', address.toString());
                        return Promise.all([
                            // Primary device
                            sessionCipher.closeOpenSessionForDevice(),
                            // The rest of their devices
                            window.textsecure.storage.protocol.archiveSiblingSessions(address.toString()),
                        ]).then(() => {
                            throw error;
                        }, innerError => {
                            window.log.error(`doSendMessage: Error closing sessions: ${innerError.stack}`);
                            throw error;
                        });
                    }
                    this.registerError(identifier, 'Failed to create or send message', error);
                });
        }
        async getStaleDeviceIdsForIdentifier(identifier) {
            return window.textsecure.storage.protocol
                .getDeviceIds(identifier)
                .then(async (deviceIds) => {
                    if (deviceIds.length === 0) {
                        return [1];
                    }
                    const updateDevices = [];
                    return Promise.all(deviceIds.map(async (deviceId) => {
                        const address = new window.libsignal.SignalProtocolAddress(identifier, deviceId);
                        const sessionCipher = new window.libsignal.SessionCipher(window.textsecure.storage.protocol, address);
                        return sessionCipher.hasOpenSession().then(hasSession => {
                            if (!hasSession) {
                                updateDevices.push(deviceId);
                            }
                        });
                    })).then(() => updateDevices);
                });
        }
        async removeDeviceIdsForIdentifier(identifier, deviceIdsToRemove) {
            let promise = Promise.resolve();
            // tslint:disable-next-line forin no-for-in no-for-in-array
            for (const j in deviceIdsToRemove) {
                promise = promise.then(async () => {
                    const encodedAddress = `${identifier}.${deviceIdsToRemove[j]}`;
                    return window.textsecure.storage.protocol.removeSession(encodedAddress);
                });
            }
            return promise;
        }
        async sendToIdentifier(identifier) {
            try {
                const updateDevices = await this.getStaleDeviceIdsForIdentifier(identifier);
                await this.getKeysForIdentifier(identifier, updateDevices);
                await this.reloadDevicesAndSend(identifier, true)();
            }
            catch (error) {
                if (error.message === 'Identity key changed') {
                    const newError = new Errors_1.OutgoingIdentityKeyError(identifier, error.originalMessage, error.timestamp, error.identityKey);
                    this.registerError(identifier, 'Identity key changed', newError);
                }
                else {
                    this.registerError(identifier, `Failed to retrieve new device keys for number ${identifier}`, error);
                }
            }
        }
    }
    exports.default = OutgoingMessage;
})();