/*
 * vim: ts=4:sw=4:expandtab
 */

(function () {
    'use strict';
    window.Whisper             = window.Whisper             || {};
    window.Whisper.Database    = window.Whisper.Database    || {};
    window.Whisper.Database.id = window.Whisper.Database.id || 'signal';
    window.Whisper.Database.nolog = true;

    window.Whisper.Database.cleanMessageAttachments = function(message) {
        var attachments = message.attachments;
        var changed = false;

        if (!attachments || !attachments.length) {
            return false;
        }

        for (var i = 0, max = attachments.length; i < max; i += 1) {
            var attachment = attachments[i];

            // catch missing and non-string filenames
            if (typeof attachment.fileName !== 'string') {
                if (attachment.fileName) {
                    delete attachment.fileName;
                    changed = true;
                }

                // if id is falsey, or neither number or string, we make our own id
                if (!attachment.id || (typeof attachment.id !== 'number' && typeof attachment.id !== 'string')) {
                    attachment.id = _.uniqueId('attachment');
                    changed = true;
                }
            }
            // if contentType is truthy, we ensure it's a string
            if (attachment.contentType && typeof attachment.contentType !== 'string') {
                delete attachment.contentType;
                changed = true;
            }
        }

        // elminate all attachments without data
        var attachmentsWithData = _.filter(attachments, function(attachment) {
            return attachment.data;
        });

        if (attachments.length !== attachmentsWithData.length) {
            message.attachments = attachmentsWithData;
            changed = true;
        }

        return changed;
    };

    window.Whisper.Database.dropZeroLengthAttachments = function(message) {
        var attachments = message.attachments;
        var changed = false;

        if (!attachments || !attachments.length) {
            return false;
        }

        var attachmentsWithData = _.filter(attachments, function(attachment) {
            return attachment.data && (attachment.data.length || attachment.data.byteLength);
        });

        if (attachments.length !== attachmentsWithData.length) {
            message.attachments = attachmentsWithData;
            changed = true;
        }

        return changed;
    };

    Whisper.Database.migrations = [
        {
            version: "1.0",
            migrate: function(transaction, next) {
                console.log('migration 1.0');
                console.log('creating object stores');
                var messages = transaction.db.createObjectStore("messages");
                messages.createIndex("conversation", ["conversationId", "received_at"], { unique: false });
                messages.createIndex("receipt", "sent_at", { unique: false });

                var conversations = transaction.db.createObjectStore("conversations");
                conversations.createIndex("inbox", "active_at", { unique: false });
                conversations.createIndex("group", "members", { unique: false, multiEntry: true });
                conversations.createIndex("type", "type", { unique: false });

                var groups = transaction.db.createObjectStore('groups');

                var sessions = transaction.db.createObjectStore('sessions');
                var identityKeys = transaction.db.createObjectStore('identityKeys');

                var preKeys = transaction.db.createObjectStore("preKeys");
                var signedPreKeys = transaction.db.createObjectStore("signedPreKeys");

                var items = transaction.db.createObjectStore("items");
                next();
            }
        },
        {
            version: "2.0",
            migrate: function(transaction, next) {
                console.log('migration 2.0');
                var conversations = transaction.objectStore("conversations");
                conversations.createIndex("search", "tokens", { unique: false, multiEntry: true });

                window.addEventListener('storage_ready', function() {
                    console.log('migrating search tokens');
                    var all = new Whisper.ConversationCollection();
                    all.fetch().then(function() {
                        all.each(function(model) {
                            model.updateTokens();
                            model.save();
                        });
                    });
                });
                next();
            }
        },
        {
            version: "3.0",
            migrate: function(transaction, next) {
                console.log('migration 3.0');
                var conversations = transaction.objectStore("items");

                window.addEventListener('storage_ready', function() {
                    console.log('migrating unread count');
                    var all = new Whisper.ConversationCollection();
                    all.fetch().then(function() {
                        var unreadCount = all.reduce(function(total, model) {
                            var count = model.get('unreadCount');
                            if (count === undefined) {
                                count = 0;
                            }
                            return total + count;
                        }, 0);
                        storage.remove('unreadCount');
                        storage.put('unreadCount', unreadCount);
                    });
                });
                next();
            }
        },
        {
            version: "4.0",
            migrate: function(transaction, next) {
                console.log('migration 4.0');
                window.addEventListener('storage_ready', function() {
                    console.log('migrating search tokens');
                    var all = new Whisper.ConversationCollection();
                    all.fetch().then(function() {
                        all.each(function(c) {
                            c.updateTokens();
                            c.save();
                        });
                    });
                });
                next();
            }
        },
        {
            version: "5.0",
            migrate: function(transaction, next) {
                console.log('migration 5.0');
                window.addEventListener('storage_ready', function() {
                    console.log('migrating registration flags');
                    if (storage.get("chromiumRegistrationDone") === "") {
                        storage.put("chromiumRegistrationDoneEver", "");
                    }
                });
                next();
            }
        },
        {
            version: "6.0",
            migrate: function(transaction, next) {
                console.log('migration 6.0');
                window.addEventListener('storage_ready', function() {
                    console.log('migrating registration flags');
                    storage.onready(function() {
                        if (storage.get("chromiumRegistrationDone") === "") {
                            storage.put("chromiumRegistrationDoneEver", "");
                            next();
                        }
                    });
                });
                next();
            }
        },
        {
            version: "7.0",
            migrate: function(transaction, next) {
                console.log('migration 7.0');
                console.log('creating debug log');
                transaction.db.createObjectStore("debug");
                next();
            }
        },
        {
            version: "8.0",
            migrate: function(transaction, next) {
                console.log('migration 8.0');
                console.log('creating unread message index');
                var conversations = transaction.objectStore('messages');
                conversations.createIndex('unread', ['conversationId', 'unread'], { unique: false });
                next();
            }
        },
        {
            version: "9.0",
            migrate: function(transaction, next) {
                console.log('migration 9.0');
                window.addEventListener('storage_ready', function() {
                    console.log('marking contacts and groups active');
                    var all = new Whisper.ConversationCollection();
                    var myNumber = textsecure.storage.user.getNumber();
                    all.fetch().then(function() {
                        var inactive = all.filter(function(model) {
                            return !model.get('active_at') && model.id !== myNumber;
                        });
                        inactive.sort(function(m1, m2) {
                            var title1 = m1.getTitle().toLowerCase();
                            var title2 = m2.getTitle().toLowerCase();
                            if (title1 ===  title2) {
                                return 0;
                            }
                            if (title1 < title2) {
                                return -1;
                            }
                            if (title1 > title2) {
                                return 1;
                            }
                        });
                        inactive.forEach(function(model) {
                            if (model.isPrivate() || !model.get('left')) {
                                model.save({ active_at: 1 });
                            }
                        });
                    });
                });
                next();
            }
        },
        {
            version: "10.0",
            migrate: function(transaction, next) {
                console.log('migration 10.0');
                console.log('creating expiring message index');
                var messages = transaction.objectStore('messages');
                messages.createIndex('expire', 'expireTimer', { unique: false });
                next();
            }
        },
        {
            version: "11.0",
            migrate: function(transaction, next) {
                console.log('migration 11.0');
                console.log('creating expires_at message index');
                var messages = transaction.objectStore('messages');
                messages.createIndex('expires_at', 'expires_at', { unique: false });
                next();
            }
        },
        {
            version: "12.0",
            migrate: function(transaction, next) {
                console.log('migration 12.0');
                console.log('cleaning up expiring messages with no expires_at');
                window.addEventListener('storage_ready', function() {
                    var messages = new Whisper.MessageCollection();
                    messages.fetch({
                      conditions: {expireTimer: {$gt: 0}},
                      addIndividually: true
                    });
                    messages.on('add', function(m) {
                      messages.remove(m);
                    });
                });
                next();
            }
        },
        {
            version: "13.0",
            migrate: function(transaction, next) {
                console.log('migration 13.0');
                console.log('Adding fields to identity keys');
                var identityKeys = transaction.objectStore('identityKeys');
                var request = identityKeys.openCursor();
                var promises = [];
                request.onsuccess = function(event) {
                  var cursor = event.target.result;
                  if (cursor) {
                    var attributes = cursor.value;
                    attributes.timestamp = 0;
                    attributes.firstUse = false;
                    attributes.nonblockingApproval = false;
                    attributes.verified = 0;
                    promises.push(new Promise(function(resolve, reject) {
                      var putRequest = identityKeys.put(attributes, attributes.id);
                      putRequest.onsuccess = resolve;
                      putRequest.onerror = function(e) {
                        console.log(e);
                        reject(e);
                      };
                    }));
                    cursor.continue();
                  } else {
                    // no more results
                    Promise.all(promises).then(function() {
                      next();
                    });
                  }
                };
                request.onerror = function(event) {
                  console.log(event);
                };
            }
        },
        {
            version: "14.0",
            migrate: function(transaction, next) {
                console.log('migration 14.0');
                console.log('Adding unprocessed message store');
                var unprocessed = transaction.db.createObjectStore('unprocessed');
                unprocessed.createIndex('received', 'timestamp', { unique: false });
                next();
            }
        },
        {
            version: "15.0",
            migrate: function(transaction, next) {
                console.log('migration 15.0');
                console.log('Adding messages index for de-duplication');
                var messages = transaction.objectStore('messages');
                messages.createIndex('unique', ['source', 'sourceDevice', 'sent_at'], { unique: true });
                next();
            }
        },
        {
            version: "16.0",
            migrate: function(transaction, next) {
                console.log('migration 16.0');
                console.log('Cleaning up dirty attachment data');

                var messages = transaction.objectStore('messages');
                var queryRequest = messages.openCursor();
                var promises = [];

                queryRequest.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (!cursor) {
                        return Promise.all(promises).then(function() {
                            console.log('Fixed', promises.length, 'messages with unexpected attachment structure');
                            next();
                        });
                    }

                    var message = cursor.value;
                    var changed = window.Whisper.Database.cleanMessageAttachments(message);

                    if (!changed) {
                        return cursor.continue();
                    }

                    promises.push(new Promise(function(resolve, reject) {
                        var putRequest = messages.put(message, message.id);
                        putRequest.onsuccess = resolve;
                        putRequest.onerror = function(e) {
                            console.log(e);
                            reject(e);
                        };
                    }));

                    return cursor.continue();
                };

                queryRequest.onerror = function(event) {
                    console.log(event);
                };
            }
        },
        {
            version: "17.0",
            migrate: function(transaction, next) {
                console.log('migration 17.0');
                console.log('Removing attachments with zero-length data');

                var messages = transaction.objectStore('messages');
                var queryRequest = messages.openCursor();
                var promises = [];

                queryRequest.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (!cursor) {
                        return Promise.all(promises).then(function() {
                            console.log('Fixed', promises.length, 'messages with unexpected attachment structure');
                            next();
                        });
                    }

                    var message = cursor.value;
                    var changed = window.Whisper.Database.dropZeroLengthAttachments(message);

                    if (!changed) {
                        return cursor.continue();
                    }

                    promises.push(new Promise(function(resolve, reject) {
                        var putRequest = messages.put(message, message.id);
                        putRequest.onsuccess = resolve;
                        putRequest.onerror = function(e) {
                            console.log(e);
                            reject(e);
                        };
                    }));

                    return cursor.continue();
                };

                queryRequest.onerror = function(event) {
                    console.log(event);
                };
            }
        },
    ];
}());
