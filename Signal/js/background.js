/*
 * vim: ts=4:sw=4:expandtab
 */

;(function() {
    'use strict';
    window.onInvalidStateError = function(e) {
        console.log(e);
    };

    console.log('background page reloaded');
    extension.notification.init();

    // Close and reopen existing windows
    var open = false;
    var initialLoadComplete = false;
    extension.windows.getAll().forEach(function(appWindow) {
        open = true;
        appWindow.close();
    });

    // start a background worker for ecc
    textsecure.startWorker('js/libsignal-protocol-worker.js');
    Whisper.KeyChangeListener.init(textsecure.storage.protocol);
    textsecure.storage.protocol.on('removePreKey', function() {
        getAccountManager().refreshPreKeys();
    });

    extension.onLaunched(function() {
        console.log('extension launched');
        storage.onready(function() {
            if (Whisper.Registration.everDone()) {
                openInbox();
            }
            if (!Whisper.Registration.isDone()) {
                extension.install();
            }
        });
    });

    var SERVER_URL = window.config.serverUrl;
    var SERVER_PORTS = [80, 4433, 8443];
    var messageReceiver;
    window.getSocketStatus = function() {
        if (messageReceiver) {
            return messageReceiver.getStatus();
        } else {
            return -1;
        }
    };
    Whisper.events = _.clone(Backbone.Events);
    var accountManager;
    window.getAccountManager = function() {
        if (!accountManager) {
            var USERNAME = storage.get('number_id');
            var PASSWORD = storage.get('password');
            accountManager = new textsecure.AccountManager(
                SERVER_URL, SERVER_PORTS, USERNAME, PASSWORD
            );
            accountManager.addEventListener('registration', function() {
                if (!Whisper.Registration.everDone()) {
                    storage.put('safety-numbers-approval', false);
                }
                Whisper.Registration.markDone();
                console.log("dispatching registration event");
                Whisper.events.trigger('registration_done');
            });
        }
        return accountManager;
    };

    function isTimeToUpgrade(text) {
        var percentage = parseInt(text, 10);

        if (isNaN(percentage)) {
            return false;
        }

        var roll = _.random(1, 100);
        return roll <= percentage;
    }

    var connectCount = 0;
    storage.fetch();
    storage.onready(function() {
        ConversationController.load();

        window.dispatchEvent(new Event('storage_ready'));
        setUnreadCount(storage.get("unreadCount", 0));

        if (Whisper.Registration.isDone()) {
            extension.keepAwake();
            connect();
        }

        console.log("listening for registration events");
        Whisper.events.on('registration_done', function() {
            console.log("handling registration event");
            extension.keepAwake();
            connect(true);
        });

        if (open) {
            openInbox();
        }

        Whisper.WallClockListener.init(Whisper.events);
        Whisper.ExpiringMessagesListener.init(Whisper.events);
    });

    window.getSyncRequest = function() {
        return new textsecure.SyncRequest(textsecure.messaging, messageReceiver);
    };

    Whisper.events.on('start-shutdown', function() {
      Whisper.RotateSignedPreKeyListener.stop();

      if (messageReceiver) {
        messageReceiver.close().then(function() {
          Whisper.events.trigger('shutdown-complete');
        });
        messageReceiver = null;
      } else {
        Whisper.events.trigger('shutdown-complete');
      }
    });

    function connect(firstRun) {
        window.removeEventListener('online', connect);
        window.addEventListener('offline', disconnect);

        // End of day, November 15th, 2018, Pacific Time (midnight the next day)
        window.EXPIRATION_TIME = new Date('2018-11-16T08:00:00.000Z');
        var timeLeft = window.EXPIRATION_TIME.getTime() - Date.now();
        if (timeLeft <= 0) {
            // start the migrate process, don't start up normally
            //return window.owsDesktopApp.getAppView().then(function(inboxView) {
            //    inboxView.showUpgradeScreen();
            //});
        }

        if (!Whisper.Registration.isDone()) { return; }
        if (Whisper.Migration.inProgress()) { return; }

        if (messageReceiver) {
            messageReceiver.close();
            messageReceiver = null;
        }

        Whisper.RotateSignedPreKeyListener.init(Whisper.events);

        var USERNAME = storage.get('number_id');
        var PASSWORD = storage.get('password');
        var mySignalingKey = storage.get('signaling_key');

        connectCount += 1;
        var options = {
            retryCached: connectCount === 1,
            serverTrustRoot: window.config.serverTrustRoot,
        };

        // initialize the socket and start listening for messages
        messageReceiver = new textsecure.MessageReceiver(
            SERVER_URL, SERVER_PORTS, USERNAME, PASSWORD, mySignalingKey, options
        );
        messageReceiver.addEventListener('message', onMessageReceived);
        messageReceiver.addEventListener('receipt', onDeliveryReceipt);
        messageReceiver.addEventListener('contact', onContactReceived);
        messageReceiver.addEventListener('group', onGroupReceived);
        messageReceiver.addEventListener('sent', onSentMessage);
        messageReceiver.addEventListener('read', onReadReceipt);
        messageReceiver.addEventListener('verified', onVerified);
        messageReceiver.addEventListener('error', onError);
        messageReceiver.addEventListener('empty', onEmpty);
        messageReceiver.addEventListener('progress', onProgress);

        window.textsecure.messaging = new textsecure.MessageSender(
            SERVER_URL, SERVER_PORTS, USERNAME, PASSWORD
        );

        // Because v0.43.2 introduced a bug that lost contact details, v0.43.4 introduces
        //   a one-time contact sync to restore all lost contact/group information. We
        //   disable this checking if a user is first registering.
        var key = 'chrome-contact-sync-v0.43.4';
        if (!storage.get(key)) {
            storage.put(key, true);

            if (!firstRun && textsecure.storage.user.getDeviceId() != '1') {
                window.getSyncRequest();
            }
        }

        if (firstRun === true && textsecure.storage.user.getDeviceId() != '1') {
            if (!storage.get('theme-setting') && textsecure.storage.get('userAgent') === 'OWI') {
                storage.put('theme-setting', 'ios');
            }
            var syncRequest = new textsecure.SyncRequest(textsecure.messaging, messageReceiver);
            Whisper.events.trigger('contactsync:begin');
            syncRequest.addEventListener('success', function() {
                console.log('sync successful');
                storage.put('synced_at', Date.now());
                Whisper.events.trigger('contactsync');
            });
            syncRequest.addEventListener('timeout', function() {
                console.log('sync timed out');
                Whisper.events.trigger('contactsync');
            });
        }
    }

    function onEmpty() {
        initialLoadComplete = true;

        var interval = setInterval(function() {
            var view = window.owsDesktopApp.inboxView;
            if (view) {
                clearInterval(interval);
                interval = null;
                view.onEmpty();
            }
        }, 500);
    }
    function onProgress(ev) {
        var count = ev.count;

        var view = window.owsDesktopApp.inboxView;
        if (view) {
            view.onProgress(count);
        }
    }

    function onContactReceived(ev) {
        var details = ev.contactDetails;

        var id = details.number;
        var c = new Whisper.Conversation({
            id: id
        });
        var error = c.validateNumber();
        if (error) {
            console.log('Invalid contact received', error && error.stack ? error.stack : error);
            return;
        }

        return ConversationController.getOrCreateAndWait(id, 'private')
            .then(function(conversation) {
                return new Promise(function(resolve, reject) {
                    conversation.save({
                        name: details.name,
                        avatar: details.avatar,
                        color: details.color,
                        active_at: conversation.get('active_at') || Date.now(),
                    }).then(resolve, reject);
                }).then(function() {
                    if (details.verified) {
                        var verified = details.verified;
                        var ev = new Event('verified');
                        ev.verified = {
                            state: verified.state,
                            destination: verified.destination,
                            identityKey: verified.identityKey.toArrayBuffer(),
                        };
                        ev.viaContactSync = true;
                        return onVerified(ev);
                    }
                });
            })
            .then(ev.confirm)
            .catch(function(error) {
                console.log(
                    'onContactReceived error:',
                    error && error.stack ? error.stack : error
                );
            });
    }

    function onGroupReceived(ev) {
        var details = ev.groupDetails;
        var id = details.id;

        return ConversationController.getOrCreateAndWait(id, 'group').then(function(conversation) {
            var updates = {
                name: details.name,
                members: details.members,
                avatar: details.avatar,
                type: 'group',
            };
            if (details.active) {
                updates.active_at = Date.now();
            } else {
                updates.left = true;
            }
            return new Promise(function(resolve, reject) {
                conversation.save(updates).then(resolve, reject);
            }).then(ev.confirm);
        });
    }

    function onMessageReceived(ev) {
        var data = ev.data;
        var message = initIncomingMessage(data);

        return isMessageDuplicate(message).then(function(isDuplicate) {
            if (isDuplicate) {
                console.log('Received duplicate message', message.idForLogging());
                ev.confirm();
                return;
            }

            var type, id;
            if (data.message.group) {
                type = 'group';
                id = data.message.group.id;
            } else {
                type = 'private';
                id = data.source;
            }

            return ConversationController.getOrCreateAndWait(id, type).then(function() {
                return message.handleDataMessage(data.message, ev.confirm, {
                    initialLoadComplete: initialLoadComplete
                });
            });
        });
    }

    function onSentMessage(ev) {
        var now = new Date().getTime();
        var data = ev.data;

        var message = new Whisper.Message({
            source         : textsecure.storage.user.getNumber(),
            sourceDevice   : data.device,
            sent_at        : data.timestamp,
            received_at    : now,
            conversationId : data.destination,
            type           : 'outgoing',
            sent           : true,
            expirationStartTimestamp: data.expirationStartTimestamp,
        });

        return isMessageDuplicate(message).then(function(isDuplicate) {
            if (isDuplicate) {
                console.log('Received duplicate message', message.idForLogging());
                ev.confirm();
                return;
            }

            var type, id;
            if (data.message.group) {
                type = 'group';
                id = data.message.group.id;
            } else {
                type = 'private';
                id = data.destination;
            }

            return ConversationController.getOrCreateAndWait(id, type).then(function() {
                return message.handleDataMessage(data.message, ev.confirm, {
                    initialLoadComplete: initialLoadComplete
                });
            });
        });
    }

    function isMessageDuplicate(message) {
        return new Promise(function(resolve) {
            var fetcher = new Whisper.Message();
            var options = {
                index: {
                    name: 'unique',
                    value: [
                        message.get('source'),
                        message.get('sourceDevice'),
                        message.get('sent_at')
                    ]
                }
            };

            fetcher.fetch(options).always(function() {
                if (fetcher.get('id')) {
                    return resolve(true);
                }

                return resolve(false);
            });
        }).catch(function(error) {
            console.log('isMessageDuplicate error:', error && error.stack ? error.stack : error);
            return false;
        });
    }

    function initIncomingMessage(data) {
        var message = new Whisper.Message({
            source         : data.source,
            sourceDevice   : data.sourceDevice,
            sent_at        : data.timestamp,
            received_at    : data.receivedAt || Date.now(),
            conversationId : data.source,
            type           : 'incoming',
            unread         : 1
        });

        return message;
    }

    function disconnect() {
        window.removeEventListener('offline', disconnect);
        window.addEventListener('online', connect);

        console.log('offline');
        if (messageReceiver) {
            messageReceiver.close();
            messageReceiver = null;
        }
    }

    function onError(ev) {
        var error = ev.error;
        console.log(error);
        console.log(error.stack);

        if (error.name === 'HTTPError' && (error.code == 401 || error.code == 403)) {
            Whisper.Registration.remove();
            Whisper.events.trigger('unauthorized');
            extension.install();
            return;
        }

        if (error.name === 'HTTPError' && error.code == -1) {
            // Failed to connect to server
            if (navigator.onLine) {
                console.log('retrying in 1 minute');
                setTimeout(connect, 60000);

                Whisper.events.trigger('reconnectTimer');
            }
            return;
        }

        if (ev.proto) {
            if (error.name === 'MessageCounterError') {
                if (ev.confirm) {
                    ev.confirm();
                }
                // Ignore this message. It is likely a duplicate delivery
                // because the server lost our ack the first time.
                return;
            }
            var envelope = ev.proto;
            var message = initIncomingMessage(envelope);

            return message.saveErrors(error).then(function() {
                var id = message.get('conversationId');
                return ConversationController.getOrCreateAndWait(id, 'private').then(function(conversation) {
                    conversation.set({
                        active_at: Date.now(),
                        unreadCount: conversation.get('unreadCount') + 1
                    });

                    var conversation_timestamp = conversation.get('timestamp');
                    var message_timestamp = message.get('timestamp');
                    if (!conversation_timestamp || message_timestamp > conversation_timestamp) {
                        conversation.set({ timestamp: message.get('sent_at') });
                    }

                    conversation.trigger('newmessage', message);
                    if (initialLoadComplete) {
                        conversation.notify(message);
                    }

                    if (ev.confirm) {
                        ev.confirm();
                    }

                    return new Promise(function(resolve, reject) {
                        conversation.save().then(resolve, reject);
                    });
                });
            });
        }

        throw error;
    }

    function onReadReceipt(ev) {
        var read_at   = ev.timestamp;
        var timestamp = ev.read.timestamp;
        var sender    = ev.read.sender;
        console.log('read receipt', sender, timestamp);

        var receipt = Whisper.ReadReceipts.add({
            sender    : sender,
            timestamp : timestamp,
            read_at   : read_at
        });

        receipt.on('remove', ev.confirm);

        // Calling this directly so we can wait for completion
        return Whisper.ReadReceipts.onReceipt(receipt);
    }

    function onVerified(ev) {
        var number   = ev.verified.destination;
        var key      = ev.verified.identityKey;
        var state;

        var c = new Whisper.Conversation({
            id: number
        });
        var error = c.validateNumber();
        if (error) {
            console.log(
                'Invalid verified sync received',
                error && error.stack ? error.stack : error
            );
            return;
        }

        switch(ev.verified.state) {
            case textsecure.protobuf.Verified.State.DEFAULT:
                state = 'DEFAULT';
                break;
            case textsecure.protobuf.Verified.State.VERIFIED:
                state = 'VERIFIED';
                break;
            case textsecure.protobuf.Verified.State.UNVERIFIED:
                state = 'UNVERIFIED';
                break;
        }

        console.log('got verified sync for', number, state,
            ev.viaContactSync ? 'via contact sync' : '');

        return ConversationController.getOrCreateAndWait(number, 'private').then(function(contact) {
            var options = {
                viaSyncMessage: true,
                viaContactSync: ev.viaContactSync,
                key: key
            };

            if (state === 'VERIFIED') {
                return contact.setVerified(options).then(ev.confirm);
            } else if (state === 'DEFAULT') {
                return contact.setVerifiedDefault(options).then(ev.confirm);
            } else {
                return contact.setUnverified(options).then(ev.confirm);
            }
        });
    }

    function onDeliveryReceipt(ev) {
        var pushMessage = ev.proto;
        var timestamp = pushMessage.timestamp.toNumber();
        console.log(
            'delivery receipt from',
            pushMessage.source + '.' + pushMessage.sourceDevice,
            timestamp
        );

        var receipt = Whisper.DeliveryReceipts.add({
            timestamp: timestamp,
            source: pushMessage.source
        });

        receipt.on('remove', ev.confirm);

        // Calling this directly so we can wait for completion
        return Whisper.DeliveryReceipts.onReceipt(receipt);
    }

    window.owsDesktopApp = {
        getAppView: function(destWindow) {
            var self = this;

            return ConversationController.loadPromise().then(function() {
                try {
                    if (self.inboxView) { self.inboxView.remove(); }
                    self.inboxView = new Whisper.InboxView({
                        model: self,
                        window: destWindow,
                        initialLoadComplete: initialLoadComplete
                    });
                    self.openConversation(getOpenConversation());

                    return self.inboxView;

                } catch (e) {
                    console.log(e);
                }
            });
        },
        openConversation: function(conversation) {
            if (this.inboxView && conversation) {
                this.inboxView.openConversation(null, conversation);
            }
        }
    };

    Whisper.events.on('unauthorized', function() {
        if (owsDesktopApp.inboxView) {
            owsDesktopApp.inboxView.networkStatusView.update();
        }
    });
    Whisper.events.on('reconnectTimer', function() {
        if (owsDesktopApp.inboxView) {
            owsDesktopApp.inboxView.networkStatusView.setSocketReconnectInterval(60000);
        }
    });

    //chrome.commands.onCommand.addListener(function(command) {
    //    if (command === 'show_signal') {
    //        openInbox();
    //    }
    //});

})();
