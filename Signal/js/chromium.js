/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';
    // Browser specific functions for Chrom*

    if (!window.parent.locales) {
        $.getJSON('_locales/en/messages.json', function (data) {
            window.parent.locales = data;
        });
    }
    
    window.extension = window.extension || {};

    window.extension.navigator = (function () {
        var self = {},
            tabs = {};
        tabs.create = function (url) {
            if (chrome.tabs) {
                chrome.tabs.create({url: url});
            } else {
                extension.windows.open({url: url});
            }
        };
        self.tabs = tabs;

        self.setBadgeText = function (text) {
            if (chrome.browserAction && chrome.browserAction.setBadgeText) {
                chrome.browserAction.setBadgeText({text: String(text)});
            }
        };

        return self;
    }());

    extension.windows = {
        open: function(options, callback) {
            if (chrome.windows) {
                chrome.windows.create(options, callback);
            } else if (chrome.app.window) {
                var url = options.url;
                delete options.url;
                chrome.app.window.create(url, options, callback);
            }
            var element = window.parent.document.getElementById('container');
            element.src = options.url;
        },

        focus: function(id, callback) {
            if (chrome.windows) {
                chrome.windows.update(id, { focused: true }, function() {
                    callback(chrome.runtime.lastError);
                });
            } else if (chrome.app.window) {
                var appWindow = chrome.app.window.get(id);
                if (appWindow) {
                    appWindow.show();
                    appWindow.focus();
                    callback();
                } else {
                    callback('No window found for id ' + id);
                }
            }
        },

        getCurrent: function(callback) {
            if (chrome.windows) {
                chrome.windows.getCurrent(callback);
            } else if (chrome.app.window) {
                callback(chrome.app.window.current());
            }
        },

        remove: function(windowId) {
            if (chrome.windows) {
                chrome.windows.remove(windowId);
            } else if (chrome.app.window) {
                chrome.app.window.get(windowId).close();
            }
        },

        getBackground: function(callback) {
            var getBackground;
            //if (chrome.extension) {
                //var bg = chrome.extension.getBackgroundPage();
                var bg = window.parent;
                bg.storage.onready(function() {
                    callback(bg);
                    //resolve();
                });
            //} else if (chrome.runtime) {
            //    chrome.runtime.getBackgroundPage(function(bg) {
            //        bg.storage.onready(function() {
            //            callback(bg);
            //        });
            //    });
            //}
        },

        getAll: function() {
            //return chrome.app.window.getAll();
            return [];
        },

        getViews: function() {
            if (chrome.extension) {
                return chrome.extension.getViews();
            } else if (chrome.app.window) {
                return chrome.app.window.getAll().map(function(appWindow) {
                    return appWindow.contentWindow;
                });
            }
        },

        onSuspend: function(callback) {
            if (chrome.runtime) {
                chrome.runtime.onSuspend.addListener(callback);
            } else {
                window.addEventListener('beforeunload', callback);
            }
        },
        onClosed: function(callback) {
            // assumes only one front end window
            if (window.chrome && chrome.app && chrome.app.window) {
                return chrome.app.window.getAll()[0].onClosed.addListener(callback);
            } else {
                window.addEventListener('beforeunload', callback);
            }
        },

        drawAttention: function(window_id) {
            if (chrome.app.window) {
                var w = chrome.app.window.get(window_id);
                if (w) {
                    w.clearAttention();
                    w.drawAttention();
                }
            }
        },

        clearAttention: function(window_id) {
            if (chrome.app.window) {
                var w = chrome.app.window.get(window_id);
                if (w) {
                    w.clearAttention();
                }
            }
        }

    };

    extension.onLaunched = function(callback) {
        if (chrome.browserAction && chrome.browserAction.onClicked) {
            chrome.browserAction.onClicked.addListener(callback);
        }
        if (chrome.app && chrome.app.runtime) {
            chrome.app.runtime.onLaunched.addListener(callback);
        }
    };

    // Translate
    window.i18n = function(message, substitutions) {
        if (window.chrome && chrome.i18n) {
            return chrome.i18n.getMessage(message, substitutions);
        }
        if (window.parent.locales) {
            var i18nmessage = window.parent.locales[message].message;
            //if (substitutions) {
            if ($.isArray(substitutions)) {
                for (var i = 0; i < substitutions.length; i++) {
                    i18nmessage = i18nmessage.replace(/\$.*\$/, substitutions[i]);
                }
            } else if (typeof substitutions === 'string') {
                i18nmessage = i18nmessage.replace(/\$.*\$/, substitutions);
            }
            //}
            return i18nmessage;
        }
    };
    i18n.getLocale = function() {
        if (window.chrome && chrome.i18n) {
            return chrome.i18n.getUILanguage();
        }
        return 'en';
    };

    extension.install = function(mode) {
        var id = 'installer';
        var url = 'options.html';
        if (mode === 'standalone') {
            id = 'standalone-installer';
            url = 'register.html';
        }
        //if (!chrome.app.window.get(id)) {
            extension.windows.open({
                id: id,
                url: url,
                bounds: { width: 800, height: 666, },
                minWidth: 800,
                minHeight: 666
            });
        //}
    };

    var notification_pending = Promise.resolve();
    extension.notification = {
        init: function() {
            return;
            // register some chrome listeners
            if (chrome.notifications) {
                chrome.notifications.onClicked.addListener(function() {
                    extension.notification.clear();
                    Whisper.Notifications.onclick();
                });
                chrome.notifications.onButtonClicked.addListener(function() {
                    extension.notification.clear();
                    Whisper.Notifications.clear();
                    getInboxCollection().each(function(model) {
                        model.markRead();
                    });
                });
                chrome.notifications.onClosed.addListener(function(id, byUser) {
                    if (byUser) {
                        Whisper.Notifications.clear();
                    }
                });
            }
        },
        clear: function() {
            return;
            notification_pending = notification_pending.then(function() {
                return new Promise(function(resolve) {
                    chrome.notifications.clear('signal',  resolve);
                });
            });
        },
        update: function(options) {
            return;
            if (chrome) {
                var chromeOpts = {
                    type     : options.type,
                    title    : options.title,
                    message  : options.message || '', // required
                    iconUrl  : options.iconUrl,
                    imageUrl : options.imageUrl,
                    items    : options.items,
                    buttons  : options.buttons
                };
                notification_pending = notification_pending.then(function() {
                    return new Promise(function(resolve) {
                        chrome.notifications.update('signal', chromeOpts, function(wasUpdated) {
                            if (!wasUpdated) {
                                chrome.notifications.create('signal', chromeOpts, resolve);
                            } else {
                                resolve();
                            }
                        });
                    });
                });
            } else {
                var notification = new Notification(options.title, {
                    body : options.message,
                    icon : options.iconUrl,
                    tag  : 'signal'
                });
                notification.onclick = function() {
                    Whisper.Notifications.onclick();
                };
            }
        }
    };

    extension.keepAwake = function() {
        if (chrome && chrome.alarms) {
            chrome.alarms.onAlarm.addListener(function() {
                // nothing to do.
            });
            chrome.alarms.create('awake', {periodInMinutes: 1});
        }
    };

    //if (chrome.runtime.onInstalled) {
    //    chrome.runtime.onInstalled.addListener(function(options) {
    //        var version = chrome.runtime.getManifest().version;
    //
    //        if (options.reason === 'install') {
    //            console.log('new install:', version);
    //            extension.install();
    //        } else if (options.reason === 'update') {
    //            console.log('new update:', version, '- previous version:', options.previousVersion);
    //        } else {
    //            console.log('onInstalled', options.reason, 'version:', version);
    //        }
    //    });
    //}
}());
