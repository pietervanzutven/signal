(function () {
    var Backbone = window.Backbone;
    var BBDB = {};
    var BBDBchanged = false;

    Windows.Storage.ApplicationData.current.localFolder.getFileAsync('BBDB_import.json').then(function (file) {
        return readDatabase(file).then(() => file.deleteAsync());
    }, () => { }).then(function () {
        return Windows.Storage.ApplicationData.current.localFolder.createFileAsync('BBDB.json', Windows.Storage.CreationCollisionOption.openIfExists)
    }).then(function (file) {
        return readDatabase(file);
    }).then(function () {
        return Windows.Storage.ApplicationData.current.localFolder.getFilesAsync();
    }).then(function (files) {
        text = stringifyJSON(BBDB);
        files.forEach(
            function (file) {
                var fileName = file.name;
                if (file.fileType === '.dat' && !text.includes(fileName)) {
                    file.deleteAsync();
                }
            }
        );
    });

    function readDatabase(file) {
        return Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
            if (text !== '') {
                jQuery.extend(true, BBDB, parseJSON(text));
                Windows.Storage.ApplicationData.current.localSettings.values['number_id'] = BBDB.items.number_id && BBDB.items.number_id.value;
                Windows.Storage.ApplicationData.current.localSettings.values['password'] = BBDB.items.password && BBDB.items.password.value;
                BBDB.debug && delete BBDB['debug'];
            }
        });
    }

    setInterval(function () {
        if (BBDBchanged) {
            BBDBchanged = false;
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync('BBDB.json', Windows.Storage.CreationCollisionOption.openIfExists).then(
                function (file) {
                    Windows.Storage.FileIO.writeTextAsync(file, stringifyJSON(BBDB));
                }
            );
        }
    }, 5000);

    Backbone.sync = function (method, object, options) {
        var store = {};
        var storeName = object.storeName;
        if (BBDB[storeName]) {
            store = BBDB[storeName];
        }

        var syncDfd = Backbone.$ ? Backbone.$.Deferred && Backbone.$.Deferred() : Backbone.Deferred && Backbone.Deferred();

        new Promise((resolve, reject) => {
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
                                resp = Object.values(store).filter(element => element.source === options.index.value[0] && element.sourceDevice === options.index.value[1] && element.sent_at === options.index.value[2]);
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

                    resolve(resp);
                    break;
                case "create":
                case "update":
                    if (!object.id && object.id !== 0) {
                        object.id = Date.now();
                        object.attributes.id = object.id;
                    }
                    resp = object.toJSON();

                    var promises = [];
                    if (resp.attachments) {
                        resp.attachments.forEach(attachment => {
                            if (attachment.data instanceof ArrayBuffer) {
                                promises.push(saveMediaItem(attachment.data).then(fileName => attachment.data = fileName));
                            }
                        });
                    }
                    var avatar = resp.avatar || resp.profileAvatar;
                    if (avatar && avatar.data instanceof ArrayBuffer) {
                        promises.push(saveMediaItem(avatar.data).then(fileName => avatar.data = fileName));
                    }

                    Promise.all(promises).then(() => {
                        store[object.id] = resp;
                        BBDBchanged = true;
                        resolve(resp);
                    });
                    break;
                case "delete":
                    resp = null;

                    if (object.id || object.cid) {
                        if (object.attributes.attachments) {
                            for (var i = 0; i < object.attributes.attachments.length; i++) {
                                if (!(object.attributes.attachments[i].data instanceof ArrayBuffer)) {
                                    deleteMediaItem(object.attributes.attachments[i].data);
                                }
                            }
                        }
                        var avatar = object.attributes.avatar || object.attributes.profileAvatar;
                        if (avatar && !(avatar.data instanceof ArrayBuffer)) {
                            deleteMediaItem(avatar.data);
                        }

                        delete store[object.id];
                    } else {
                        store = {};
                    }

                    BBDBchanged = true;
                    resolve(resp);
                    break;
            }
        }).then(resp => {
            BBDB[storeName] = store;

            if (options && options.success) {
                options.success(resp);
            }
            if (syncDfd) {
                syncDfd.resolve(resp);
            }
        });

        return syncDfd && syncDfd.promise();
    };

    function saveMediaItem(dataArray) {
        var fileName = Date.now() + Math.random() + '.dat';
        var data = new Uint8Array(dataArray);
        return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.failIfExists).then(
            function (file) {
                return Windows.Storage.FileIO.writeBytesAsync(file, data);
            }).then(
            function () {
                return fileName;
            });
    }

    function deleteMediaItem(fileName) {
        Windows.Storage.ApplicationData.current.localFolder.tryGetItemAsync(fileName).then(file => file && file.deleteAsync());
    }

    function stringifyJSON(object) {
        return JSON.stringify(object, function (key, value) {
            if (value instanceof ArrayBuffer) {
                value = 'ArrayBufferString' + btoa(String.fromCharCode.apply(null, new Uint8Array(value)));
            }
            return value;
        });
    }

    function parseJSON(string) {
        return JSON.parse(string, function (key, value) {
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
            if (key === 'attachments') {
                for (var i = 0; i < value.length; i++) {
                    if (value[i].data instanceof ArrayBuffer) {
                        value[i].data = saveMediaItem(value[i].data);
                    }
                }
            }
            if ((key === 'avatar' || key === 'profileAvatar') && value && value.data instanceof ArrayBuffer) {
                value.data = saveMediaItem(value.data);
            }
            return value;
        });
    }
})()