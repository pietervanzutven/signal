(function () {
    var Backbone = window.Backbone;
    var BBDB = {};

    var Blob = window.Blob;
    window.Blob = function (array, options) {
        if (Array.isArray(array)) {
            if (typeof array[0] === 'string' && (array[0].endsWith('.jpg') || array[0].endsWith('.jpeg') || array[0].endsWith('.png') || array[0].endsWith('.mp4'))) {
                this.data = array[0];
            } else {
                return new Blob(array, options);
            }
        } else {
            return new Blob();
        }
    }

    var createObjectURL = window.URL.createObjectURL;
    window.URL.createObjectURL = function (blob) {
        if (blob.data) {
            return "ms-appdata:///local/" + blob.data;
        } else {
            return createObjectURL(blob);
        }
    }

    Windows.Storage.ApplicationData.current.localFolder.getFileAsync('BBDB_import.json').then(function (file) {
        return readDatabase(file).then(() => file.deleteAsync());
    }, () => { }).then(function () {
        return Windows.Storage.ApplicationData.current.localFolder.createFileAsync('BBDB.json', Windows.Storage.CreationCollisionOption.openIfExists)
    }).then(function (file) {
        return readDatabase(file);
    }).then(function () {
        return Windows.Storage.ApplicationData.current.localFolder.getFilesAsync();
    }).then(function (files) {
        if (BBDB.version === undefined) {
            BBDB.version = 0;
            BBDB.name = '';
            BBDB.stores = {};
            ['conversations', 'groups', 'identityKeys', 'items', 'messages', 'preKeys', 'sessions', 'signedPreKeys', 'unprocessed'].forEach(storeName => {
                BBDB.stores[storeName] = { items: BBDB[storeName], indices: {} };
                delete BBDB[storeName];
            });
        }
        Windows.Storage.ApplicationData.current.localSettings.values['number_id'] = BBDB.stores.items.items.number_id && BBDB.stores.items.items.number_id.value;
        Windows.Storage.ApplicationData.current.localSettings.values['password'] = BBDB.stores.items.items.password && BBDB.stores.items.items.password.value;
        BBDB.debug && delete BBDB['debug'];

        text = JSON.stringify(BBDB, stringifyJSON);
        files.forEach(
            function (file) {
                if (file.fileType !== '.json' && !text.includes(file.name)) {
                    file.deleteAsync();
                }
            }
        );
    });

    function readDatabase(file) {
        return Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
            if (text !== '') {
                jQuery.extend(true, BBDB, JSON.parse(text, parseJSON));
            }
        });
    }

    var timeout;
    function writeDatabase() {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(() => {
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync('BBDB.json', Windows.Storage.CreationCollisionOption.openIfExists).then(
                function (file) {
                    Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(BBDB, stringifyJSON, '\t'));
                });
        }, 5000);
    }

    Backbone.sync = function (method, object, options) {
        var store = {};
        var storeName = object.storeName;
        if (BBDB.stores[storeName]) {
            store = BBDB.stores[storeName].items;
        }

        var syncDfd = Backbone.$ ? Backbone.$.Deferred && Backbone.$.Deferred() : Backbone.Deferred && Backbone.Deferred();

        var resp = [];
        switch (method) {
            case "read":
                if (object.id) {
                    resp = store[object.id];
                } else if (options.conditions) {
                    console.log('BB conditions query not implemented');
                } else if (options.index) {
                    switch (options.index.name) {
                        case 'conversation':
                            resp = Object.values(store).filter(element => element.conversationId === options.index.lower[0]);
                            break;
                        case 'unread':
                            resp = Object.values(store).filter(element => element.conversationId === options.index.lower[0] && element.unread);
                            break;
                        case 'search':
                            resp = Object.values(store).filter(element => element.id.includes(options.index.lower) || (element.name && element.name.toLowerCase().includes(options.index.lower)));
                            break;
                        case 'receipt':
                            resp = Object.values(store).filter(element => element.sent_at === options.index.only);
                            break;
                        case 'unique':
                            resp = Object.values(store).filter(element => element.source === options.index.value[0] && element.sourceDevice === options.index.value[1] && element.sent_at === options.index.value[2])[0] || [];
                            break;
                        case 'expires_at':
                            resp = Object.values(store).filter(element => element.expires_at);
                            break;
                        case 'group':
                            resp = Object.values(store).filter(element => element.members && element.members.indexOf(options.index.only) !== -1);
                            break;
                        default:
                            console.log('BB index query not implemented: ' + options.index.name);
                    }
                } else if (options.range) {
                    resp = Object.values(store).filter(element => element.id >= options.range[0] && element.id <= options.range[1]);
                } else {
                    resp = Object.values(store);
                }
                if (Array.isArray(resp) && resp.length > 1 && options.limit) {
                    resp = resp.slice(-options.limit);
                }
                break;
            case "create":
            case "update":
                if (!object.id && object.id !== 0) {
                    object.id = Date.now();
                    object.attributes.id = object.id;
                }
                resp = object.toJSON();
                store[object.id] = resp;
                writeDatabase();
                break;
            case "delete":
                resp = null;

                if (object.id || object.cid) {
                    delete store[object.id];
                } else {
                    store = {};
                }

                writeDatabase();
                break;
        }
        if (options && options.success) {
            options.success(resp);
        }
        if (syncDfd) {
            syncDfd.resolve();
        }

        return syncDfd && syncDfd.promise();
    };

    function saveMediaItem(fileName, dataArray) {
        var data = new Uint8Array(dataArray);
        Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(
            function (file) {
                Windows.Storage.FileIO.writeBytesAsync(file, data);
            }
        );
        return fileName;
    }
    
    function stringifyJSON(key, value) {
        if (this.attachments) {
            this.attachments.forEach(attachment => {
                if (attachment.data instanceof ArrayBuffer) {
                    attachment.data = saveMediaItem(window.getGuid() + '.' + attachment.contentType.split('/')[1], attachment.data);
                }
            });
        }
        if (this.avatar && this.avatar.data instanceof ArrayBuffer) {
            this.avatar.data = saveMediaItem(this.name + '.' + this.avatar.contentType.split('/')[1], this.avatar.data);
        }
        if (this.profileAvatar && this.profileAvatar.data instanceof ArrayBuffer) {
            this.profileAvatar.data = saveMediaItem(this.name + '.' + this.profileAvatar.contentType.split('/')[1], this.profileAvatar.data);
        }
        if (value instanceof ArrayBuffer) {
            value = 'ArrayBufferString' + btoa(String.fromCharCode.apply(null, new Uint8Array(value)));
        }
        return value;
    }
    
    function parseJSON(key, value) {
        if (typeof value === 'string') {
            if (value.substring(0, 17) === 'ArrayBufferString') {
                var str = atob(value.replace('ArrayBufferString', ''));
                value = new ArrayBuffer(str.length);
                var array = new Uint8Array(value);
                for (var i = 0; i < str.length; i++) {
                    array[i] = str.charCodeAt(i);
                }
            }
        }
        return value;
    }
})()