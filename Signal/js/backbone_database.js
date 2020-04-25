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
                    var models;
                    if (object.id) {
                        models = store[object.id];
                    } else if (options.conditions) {
                        console.log('BB conditions query not implemented');
                    } else if (options.index) {
                        switch (options.index.name) {
                            case 'conversation':
                                models = Object.values(store).filter(element => element.conversationId === options.index.lower[0]);
                                break;
                            case 'unread':
                                models = Object.values(store).filter(element => element.conversationId === options.index.lower[0] && element.unread);
                                break;
                            case 'search':
                                models = Object.values(store).filter(element => element.id.includes(options.index.lower) || (element.name && element.name.toLowerCase().includes(options.index.lower)));
                                break;
                            case 'receipt':
                                models = Object.values(store).filter(element => element.sent_at === options.index.only);
                                break;
                            case 'unique':
                                models = Object.values(store).filter(element => element.source === options.index.value[0] && element.sourceDevice === options.index.value[1] && element.sent_at === options.index.value[2]);
                                break;
                            case 'expires_at':
                                models = Object.values(store).filter(element => element.expires_at);
                                break;
                            case 'group':
                                models = Object.values(store).filter(element => element.members && element.members.indexOf(options.index.only) !== -1);
                                break;
                            default:
                                console.log('BB index query not implemented: ' + options.index.name);
                        }
                    } else if (options.range) {
                        models = Object.values(store).filter(element => element.id >= options.range[0] && element.id <= options.range[1]);
                    } else {
                        models = Object.values(store);
                    }

                    var promises = [];
                    if (Array.isArray(models)) {
                        if (models.length > 1 && options.limit) {
                            models = models.slice(-options.limit);
                        }
                        models.forEach(model => {
                            var item = jQuery.extend(true, {}, model);
                            if (item.attachments) {
                                item.attachments.forEach(attachment => promises.push(loadMediaItem(attachment.data).then(value => attachment.data = value)));
                            }
                            if (item.avatar) {
                                promises.push(loadMediaItem(item.avatar.data).then(value => item.avatar.data = value));
                            }
                            if (item.profileAvatar) {
                                promises.push(loadMediaItem(item.profileAvatar.data).then(value => item.profileAvatar.data = value));
                            }
                            resp.push(item);
                        });
                    }

                    Promise.all(promises).then(() => resolve(resp), () => reject(resp));
                    break;
                case "create":
                case "update":
                    if (!object.id && object.id !== 0) {
                        object.id = Date.now();
                        object.attributes.id = object.id;
                    }
                    resp = object.toJSON();

                    var promises = [];
                    var model = jQuery.extend(true, {}, resp);
                    if (model.attachments) {
                        model.attachments.forEach(attachment => promises.push(saveMediaItem(attachment.data).then(fileName => attachment.data = fileName)));
                    }
                    if (model.avatar) {
                        promises.push(saveMediaItem(model.avatar.data).then(fileName => model.avatar.data = fileName));
                    }
                    if (model.profileAvatar) {
                        promises.push(saveMediaItem(model.profileAvatar.data).then(fileName => model.profileAvatar.data = fileName));
                    }

                    Promise.all(promises).then(() => {
                        store[object.id] = model;
                        BBDBchanged = true;
                        resolve(resp);
                    });
                    break;
                case "delete":
                    if (object.id || object.cid) {
                        var model = store[object.id];
                        if (model.attachments) {
                            model.attachments.forEach(attachment => deleteMediaItem(attachment.data));
                        }
                        if (model.avatar) {
                            deleteMediaItem(model.avatar.data);
                        }
                        if (model.profileAvatar) {
                            deleteMediaItem(model.profileAvatar.data);
                        }

                        delete store[object.id];
                    } else {
                        store = {};
                    }

                    BBDBchanged = true;
                    resolve(null);
                    break;
            }
        }).then(resp => {
            if (options && options.success) {
                options.success(resp);
            }
            if (syncDfd) {
                syncDfd.resolve();
            }
            object.trigger('sync', object, resp, options);
        }, resp => {
            if (options && options.error) {
                options.error(resp);
            }
            if (syncDfd) {
                syncDfd.reject();
            }
            object.trigger('error', object, resp, options);
        });

        return syncDfd && syncDfd.promise();
    };

    function loadMediaItem(fileName) {
        var reader, value, data;
        return Windows.Storage.ApplicationData.current.localFolder.tryGetItemAsync(fileName).then(
        function (file) {
            if (file) {
                return file.openReadAsync();
            } else {
                throw 'File not found: ' + fileName;
            }
        }).then(
        function (stream) {
            reader = Windows.Storage.Streams.DataReader(stream);
            value = new ArrayBuffer(stream.size);
            data = new Uint8Array(value);
            return reader.loadAsync(stream.size);
        }, () => null).then(
        function (arg) {
            if (arg) {
                reader.readBytes(data);
                return value;
            } else {
                return null;
            }
        });
    }

    function saveMediaItem(dataArray) {
        var fileName = Date.now() + Math.random() + '.dat';
        var data = new Uint8Array(dataArray);
        return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.failIfExists).then(
        function (file) {
            return Windows.Storage.FileIO.writeBytesAsync(file, data);
        }).then(
        function () {
            return fileName;
        })
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
            return value;
        });
    }
})()