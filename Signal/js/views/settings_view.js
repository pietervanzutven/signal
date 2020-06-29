/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';
    window.Whisper = window.Whisper || {};
    const { OS } = window.Signal;
    const { Settings } = window.Signal.Types;

    var CheckboxView = Whisper.View.extend({
        initialize: function(options) {
            this.name = options.name;
            this.defaultValue = options.defaultValue;
            this.event = options.event;
            this.populate();
        },
        events: {
            'change': 'change'
        },
        change: function(e) {
            var value = e.target.checked;
            storage.put(this.name, value);
            console.log(this.name, 'changed to', value);
            if (this.event) {
                this.$el.trigger(this.event);
            }
        },
        populate: function() {
            var value = storage.get(this.name, this.defaultValue);
            this.$('input').prop('checked', !!value);
        },
    });
    var RadioButtonGroupView = Whisper.View.extend({
        initialize: function(options) {
            this.name = options.name;
            this.defaultValue = options.defaultValue;
            this.event = options.event;
            this.populate();
        },
        events: {
            'change': 'change'
        },
        change: function(e) {
            var value = this.$(e.target).val();
            storage.put(this.name, value);
            console.log(this.name, 'changed to', value);
            if (this.event) {
                this.$el.trigger(this.event);
            }
        },
        populate: function() {
            var value = storage.get(this.name, this.defaultValue);
            this.$('#' + this.name + '-' + value).attr('checked', 'checked');
        },
    });
    Whisper.SettingsView = Whisper.View.extend({
        className: 'settings modal expand',
        templateName: 'settings',
        initialize: function() {
            this.deviceName = textsecure.storage.user.getDeviceName();
            this.render();
            new RadioButtonGroupView({
                el: this.$('.notification-settings'),
                defaultValue: 'message',
                name: 'notification-setting',
                event: 'change-notification'
            });
            new RadioButtonGroupView({
                el: this.$('.theme-settings'),
                defaultValue: 'android',
                name: 'theme-setting',
                event: 'change-theme'
            });
            if (Settings.isAudioNotificationSupported()) {
                new CheckboxView({
                    el: this.$('.audio-notification-setting'),
                    defaultValue: false,
                    name: 'audio-notification',
                    event: 'change-notification'
                });
            }
            new CheckboxView({
                el: this.$('.menu-bar-setting'),
                defaultValue: false,
                name: 'hide-menu-bar',
                event: 'change-hide-menu'
            });
            if (textsecure.storage.user.getDeviceId() != '1') {
                var syncView = new SyncView().render();
                this.$('.sync-setting').append(syncView.el);
            }
        },
        events: {
            'click .close': 'remove',
            'click .clear-data': 'onClearData',
        },
        render_attributes: function() {
            return {
              deviceNameLabel: i18n('deviceName'),
              deviceName: this.deviceName,
              theme: i18n('theme'),
              notifications: i18n('notifications'),
              notificationSettingsDialog: i18n('notificationSettingsDialog'),
              settings: i18n('settings'),
              disableNotifications: i18n('disableNotifications'),
              nameAndMessage: i18n('nameAndMessage'),
              noNameOrMessage: i18n('noNameOrMessage'),
              nameOnly: i18n('nameOnly'),
              audioNotificationDescription: i18n('audioNotificationDescription'),
              isAudioNotificationSupported: Settings.isAudioNotificationSupported(),
              themeAndroidDark: i18n('themeAndroidDark'),
              hideMenuBar: i18n('hideMenuBar'),
              clearDataHeader: i18n('clearDataHeader'),
              clearDataButton: i18n('clearDataButton'),
              clearDataExplanation: i18n('clearDataExplanation'),
            };
        },
        onClearData: function() {
            var clearDataView = new ClearDataView().render();
            $('body').append(clearDataView.el);
        },
    });

    var CLEAR_DATA_STEPS = {
        CHOICE: 1,
        DELETING: 2,
    };
    var ClearDataView = Whisper.View.extend({
        templateName: 'clear-data',
        className: 'full-screen-flow overlay',
        events: {
            'click .cancel': 'onCancel',
            'click .delete-all-data': 'onDeleteAllData',
        },
        initialize: function() {
            this.step = CLEAR_DATA_STEPS.CHOICE;
        },
        onCancel: function() {
            this.remove();
        },
        onDeleteAllData: function() {
            console.log('Deleting everything!');
            this.step = CLEAR_DATA_STEPS.DELETING;
            this.render();

            window.wrapDeferred(Backbone.sync('closeall')).then(function() {
                console.log('All database connections closed. Starting delete.');
                this.clearAllData();
            }.bind(this), function(error) {
                console.log('Something went wrong closing all database connections.');
                this.clearAllData();
            }.bind(this));
        },
        clearAllData: function() {
            var finishCount = 0;
            var finish = function() {
                finishCount += 1;
                console.log('Deletion complete, finishCount is now', finishCount);
                if (finishCount > 1) {
                    console.log('Deletion complete! Restarting now...');
                    window.restart();
                }
            };

            var request = window.indexedDB.deleteDatabase('signal');

            // None of the three of these should happen, since we close all database
            //   connections first. However, testing indicates that even if one of these
            //   handlers fires, the database is still deleted on restart.
            request.onblocked = function(event) {
                console.log('Error deleting database: Blocked.');
                finish();
            };
            request.onupgradeneeded = function(event) {
                console.log('Error deleting database: Upgrade needed.');
                finish();
            };
            request.onerror = function(event) {
                console.log('Error deleting database.');
                finish();
            };

            request.onsuccess = function(event) {
                console.log('Database deleted successfully.');
                finish();
            };

            Whisper.events.once('deleteAllLogsComplete', function() {
                console.log('Log deleted successfully.');
                finish();
            });
            window.deleteAllLogs();
        },
        render_attributes: function() {
            return {
                isStep1: this.step === CLEAR_DATA_STEPS.CHOICE,
                header: i18n('deleteAllDataHeader'),
                body: i18n('deleteAllDataBody'),
                cancelButton: i18n('cancel'),
                deleteButton: i18n('deleteAllDataButton'),

                isStep2: this.step === CLEAR_DATA_STEPS.DELETING,
                deleting: i18n('deleteAllDataProgress'),
            };
        }
    });

    var SyncView = Whisper.View.extend({
        templateName: 'syncSettings',
        className: 'syncSettings',
        events: {
            'click .sync': 'sync'
        },
        enable: function() {
            this.$('.sync').text(i18n('syncNow'));
            this.$('.sync').removeAttr('disabled');
        },
        disable: function() {
            this.$('.sync').attr('disabled', 'disabled');
            this.$('.sync').text(i18n('syncing'));
        },
        onsuccess: function() {
            storage.put('synced_at', Date.now());
            console.log('sync successful');
            this.enable();
            this.render();
        },
        ontimeout: function() {
            console.log('sync timed out');
            this.$('.synced_at').hide();
            this.$('.sync_failed').show();
            this.enable();
        },
        sync: function() {
            this.$('.sync_failed').hide();
            if (textsecure.storage.user.getDeviceId() != '1') {
                this.disable();
                var syncRequest = window.getSyncRequest();
                syncRequest.addEventListener('success', this.onsuccess.bind(this));
                syncRequest.addEventListener('timeout', this.ontimeout.bind(this));
            } else {
                console.log("Tried to sync from device 1");
            }
        },
        render_attributes: function() {
            var attrs = {
                sync: i18n('sync'),
                syncNow: i18n('syncNow'),
                syncExplanation: i18n('syncExplanation'),
                syncFailed: i18n('syncFailed')
            };
            var date = storage.get('synced_at');
            if (date) {
                date = new Date(date);
                attrs.lastSynced = i18n('lastSynced');
                attrs.syncDate = date.toLocaleDateString();
                attrs.syncTime = date.toLocaleTimeString();
            }
            return attrs;
        }
    });
})();
