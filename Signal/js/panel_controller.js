/*global $, Whisper, Backbone, extension*/
/*
 * vim: ts=4:sw=4:expandtab
 */

// This script should only be included in background.html
(function () {
    'use strict';

    window.Whisper = window.Whisper || {};

    window.isOpen = function() {
        return true;
    };

    window.drawAttention = function() {
        if (isOpen() && !isFocused()) {
            if (window.keepClear) {
                clearInterval(window.keepClear);
                delete window.keepClear;
            }
            console.log('draw attention');
            extension.windows.drawAttention(inboxWindowId);
        }
    };
    window.clearAttention = function() {
        console.log('clear attention');
        if (window.keepClear) {
            clearInterval(window.keepClear);
            delete window.keepClear;
        }
        window.keepClear = setInterval(function() {
            extension.windows.clearAttention(inboxWindowId);
        }, 2000);
    };
    var inboxWindowId = 'inbox';

    window.openInbox = function(options) {
        Whisper.events.trigger('openInbox', options);
    };

    window.setUnreadCount = function(count) {
        if (count > 0) {
            extension.navigator.setBadgeText(count);
            window.document.title = "Signal (" + count + ")";
        } else {
            extension.navigator.setBadgeText("");
            window.document.title = "Signal";
        }
    };

    window.openConversation = function(conversation) {
        Whisper.events.trigger('openConversation', conversation);
    };

})();
