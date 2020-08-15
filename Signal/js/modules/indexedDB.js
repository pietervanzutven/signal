﻿(function () {
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

    var toArray = object => Array.isArray(object) ? object : [object];

    function IDB() {
        this.name = '';
        this.version = 0;
        this.stores = {};
        this.createObjectStore = function (name) {
            this.stores[name] = { items: {}, indices: {} };
            writeJSON(this);
            var transaction = new IDBTransaction(this);
            return transaction.objectStore(name);
        }
        this.deleteObjectStore = function (name) {
            delete this.stores[name];
            writeJSON(this);
        }
        this.open = function (name, version) {
            return new IDBOpen(this, name, version);
        }
        this.transaction = function (storeName, readwrite) {
            return new IDBTransaction(this, storeName);
        }
        this.close = function () { };
    }

    function IDBRequest() {
        this.oncomplete = () => { };
        this.onupgradeneeded = () => { };
        this.onblocked = () => { };
        this.onabort = () => { };
        this.onsuccess = () => { };
        this.onerror = () => { };
    }

    function IDBTransaction(db, storeName) {
        IDBRequest.call(this);
        this.db = db;
        this.objectStore = function (storeName) {
            var store = db.stores[storeName];
            return new IDBStore(this, store.items, store.indices);
        }
    }

    function IDBStore(transaction, items, indices) {
        this.transaction = transaction;
        this.items = items;
        this.indices = indices;
        this.createIndex = function (indexName, keyPath, options) {
            this.indices[indexName] = toArray(keyPath);
            writeJSON(transaction.db);
        }
        this.index = function (keyPath) {
            return new IDBIndex(this, keyPath);
        }
        this.openCursor = function (query, direction) {
            if (query) {
                var queried = {};
                if (query.lower || query.upper) {
                    var lower = query.lower || Number.MIN_VALUE;
                    var upper = query.upper || Number.MAX_VALUE;
                    Object.keys(this.items).forEach(function (key) {
                        if ((query.lowerOpen ? key >= lower : key > lower) && (query.upperOpen ? key <= upper : key < upper)) {
                            queried[key] = this.items[key];
                        }
                    }.bind(this));
                    return new IDBCursor(new IDBStore(this.transaction, queried), direction);
                } else {
                    queried[query] = this.items[query];
                    return new IDBCursor(new IDBStore(this.transaction, queried), direction);
                }
            } else {
                return new IDBCursor(this, direction);
            }
        }
        this.get = function (key) {
            return new IDBRead(this, key);
        }
        this.add = function (item, key) {
            return new IDBWrite(this, item, key);
        }
        this.put = this.add;
        this.delete = function (key) {
            return new IDBDelete(this, key);
        }
        this.clear = function () {
            return new IDBClear(this);
        }
    }

    function IDBRange(options) {
        this.lower = toArray(options.lower);
        this.upper = toArray(options.upper);
        this.lowerOpen = toArray(options.lowerOpen);
        this.upperOpen = toArray(options.upperOpen);
        this.only = toArray(options.only);
    }

    function IDBIndex(store, keyPath) {
        IDBRequest.call(this);
        this.openCursor = function (range, direction) {
            var indexStore = new IDBStore(store.transaction, this.getItems(range));
            return indexStore.openCursor(null, direction);
        }
        this.get = function (value) {
            var indexStore = new IDBStore(store.transaction, this.getItems(value));
            return indexStore.get(0);
        }
        this.getItems = function (option) {
            var index = store.indices[keyPath];
            var length = index.length;

            var condition;
            if (!option) {
                condition = element => element.some(value => value);
            } else if ((option.lower && option.lower[0]) || (option.upper && option.upper[0])) {
                var lower = [];
                var upper = [];
                for (var i = 0; i < length; i++) {
                    lower[i] = option.lower[i] || Number.MIN_VALUE;
                    upper[i] = option.upper[i] || Number.MAX_VALUE;
                }
                var conditionLower = option.lowerOpen ? (value, i) => value >= lower[i] : (value, i) => value > lower[i];
                var conditionUpper = option.upperOpen ? (value, i) => value <= upper[i] : (value, i) => value < upper[i];
                condition = (element, i) => element.some(value => conditionLower(value, i) && conditionUpper(value, i));
            } else if (option.only && option.only[0]) {
                condition = (element, i) => element.some(value => value === option.only[i]);
            }
            else {
                condition = (element, i) => element.some(value => value === option[i]);
            }

            return Object.values(store.items).filter(item => {
                for (var i = 0; i < length; i++) {
                    var element = toArray(item[index[i]]);
                    if (!condition(element, i)) {
                        return false;
                    };
                }
                return true;
            });
        }
    }

    function IDBCursor(store, direction) {
        IDBRequest.call(this);
        this.keys = Object.keys(store.items);
        this.value = null;
        this.count = direction === 'prev' || direction === 'prevunique' ? this.keys.length - 1 : 0;
        this.direction = this.count === 0 ? 1 : -1;
        this.continue = function () {
            new Promise(function (resolve, reject) {
                if (this.count < this.keys.length && this.count >= 0) {
                    var readRequest = new IDBRead(store, this.keys[this.count]);
                    readRequest.onsuccess = function (event) {
                        this.value = event.target.result;
                        var event = { target: { result: this } };
                        resolve(event);
                    }.bind(this);
                    this.count += this.direction;
                } else {
                    var event = { target: { result: null } };
                    resolve(event);
                }
            }.bind(this)).then(function (event) {
                this.onsuccess(event);
            }.bind(this)).catch(error => {
                console.log(error);
            });
        }
        this.continue();
    }

    function IDBOpen(db, name, version) {
        IDBRequest.call(this);

        db.name = name;
        this.transaction = db.transaction();

        Windows.Storage.ApplicationData.current.localFolder.tryGetItemAsync(db.name + '_import.json').then(function (file) {
            if (file) {
                return readJSON(db, file).then(() => file.deleteAsync());
            } else {
                return Promise.resolve();
            }
        }).then(function () {
            return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(db.name + '.json', Windows.Storage.CreationCollisionOption.openIfExists)
        }).then(function (file) {
            return readJSON(db, file);
        }).then(function () {
            return Windows.Storage.ApplicationData.current.localFolder.getFilesAsync();
        }).then(function (files) {
            text = JSON.stringify(db, stringifyJSON);
            var promises = [];
            files.forEach(function (file) {
                if (file.fileType !== '.json' && !text.includes(file.name)) {
                    promises.push(file.deleteAsync());
                }
            });
            Promise.all(promises).then(function () {
                if (version > db.version) {
                    var event = { target: { result: this }, newVersion: version, oldVersion: db.version };
                    this.onupgradeneeded(event);
                    db.version = version;
                }
                var success = { target: { result: db } };
                this.onsuccess(success);
            }.bind(this));
        }.bind(this));
    }

    function IDBRead(store, key) {
        IDBRequest.call(this);
        new Promise(function (resolve, reject) {
            var event = { target: { result: store.items[key] } };
            resolve(event)
        }).then(function (event) {
            this.onsuccess(event);
        }.bind(this)).catch(error => {
            console.log(error);
        });
    }

    function IDBWrite(store, item, key) {
        IDBRequest.call(this);
        new Promise(function (resolve, reject) {
            store.items[key] = item;
            writeJSON(store.transaction.db);
            resolve();
        }).then(function () {
            store.transaction.oncomplete();
        }).catch(error => {
            console.log(error);
        });
    }

    function IDBDelete(store, key) {
        IDBRequest.call(this);
        new Promise(function (resolve, reject) {
            delete store.items[key];
            writeJSON(store.transaction.db);
            resolve();
        }).then(function () {
            store.transaction.oncomplete();
        }).catch(error => {
            console.log(error);
        });
    }

    function IDBClear(store) {
        IDBRequest.call(this);
        new Promise(function (resolve, reject) {
            store.items = [];
            writeJSON(store.transaction.db);
            resolve();
        }).then(function () {
            this.onsuccess();
        }.bind(this)).catch(error => {
            console.log(error);
        });
    }

    window.indexedDB.open = function (name, version) {
        var db = new IDB();
        return db.open(name, version);
    }

    window.IDBKeyRange.bound = function (lower, upper, lowerOpen, upperOpen) {
        return new IDBRange({ lower: lower, upper: upper, lowerOpen: lowerOpen, upperOpen: upperOpen });
    }

    window.IDBKeyRange.lowerBound = function (lower, lowerOpen) {
        return new IDBRange({ lower: lower, lowerOpen: lowerOpen });
    }

    window.IDBKeyRange.upperBound = function (upper, upperOpen) {
        return new IDBRange({ upper: upper, upperOpen: upperOpen });
    }

    window.IDBKeyRange.only = function (only) {
        return new IDBRange({ only: only });
    }

    function readJSON(db, file) {
        return Windows.Storage.FileIO.readTextAsync(file).then(function (text) {
            if (text !== '') {
                jQuery.extend(true, db, JSON.parse(text, parseJSON));
            }
        });
    }

    var timeout;
    function writeJSON(db) {
        timeout && clearTimeout(timeout);
        timeout = setTimeout(() => {
            Windows.Storage.ApplicationData.current.localFolder.createFileAsync(db.name + '.json', Windows.Storage.CreationCollisionOption.openIfExists).then(function (file) {
                Windows.Storage.FileIO.writeTextAsync(file, JSON.stringify(db, stringifyJSON, '\t'));
            });
        }, 5000);
    }

    function saveMediaItem(fileName, dataArray) {
        var data = new Uint8Array(dataArray);
        Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName, Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
            Windows.Storage.FileIO.writeBytesAsync(file, data);
        });
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