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
            version: "12.0",
            migrate: function(transaction, next) {
                console.log('migration 1.0');
                console.log('creating object stores');
                var messages = transaction.db.createObjectStore("messages");
                messages.createIndex("conversation", ["conversationId", "received_at"], { unique: false });
                messages.createIndex("receipt", "sent_at", { unique: false });
                messages.createIndex('unread', ['conversationId', 'unread'], { unique: false });
                messages.createIndex('expires_at', 'expires_at', { unique: false });

                var conversations = transaction.db.createObjectStore("conversations");
                conversations.createIndex("inbox", "active_at", { unique: false });
                conversations.createIndex("group", "members", { unique: false, multiEntry: true });
                conversations.createIndex("type", "type", { unique: false });
                conversations.createIndex("search", "tokens", { unique: false, multiEntry: true });

                var groups = transaction.db.createObjectStore('groups');

                var sessions = transaction.db.createObjectStore('sessions');
                var identityKeys = transaction.db.createObjectStore('identityKeys');
                var preKeys = transaction.db.createObjectStore("preKeys");
                var signedPreKeys = transaction.db.createObjectStore("signedPreKeys");
                var items = transaction.db.createObjectStore("items");

                console.log('creating debug log');
                var debugLog = transaction.db.createObjectStore("debug");

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
                console.log('Dropping log table, since we now log to disk');
                var messages = transaction.db.deleteObjectStore('debug');
                next();
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
