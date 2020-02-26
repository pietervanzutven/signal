/*global $, Whisper, Backbone, textsecure, extension*/
/*
 * vim: ts=4:sw=4:expandtab
 */

// This script should only be included in background.html
(function () {
    'use strict';

    window.Whisper = window.Whisper || {};

    
    var inboxFocused = false;
    window.addEventListener('blur', function() {
        inboxFocused = false;
    });
    window.addEventListener('focus', function() {
        inboxFocused = true;
        clearAttention();
    });
    window.isFocused = function() {
        return inboxFocused;
    };
    window.isOpen = function() {
        return inboxOpened;
    };

    window.drawAttention = function() {
        if (inboxOpened && !inboxFocused) {
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

    /* Inbox window controller */
    var inboxOpened = false;
    var inboxWindowId = 'inbox';
    var appWindow = null;
    window.openInbox = function() {
        console.log('open inbox');
        if (inboxOpened === false) {
            inboxOpened = true;
            owsDesktopApp.getAppView(window).then(function (appView) {
                var bodyEl = $('body');
                bodyEl[0].innerHTML = "";
                bodyEl.append(appView.el);
            });
            owsDesktopApp.openConversation(getOpenConversation());
        } else if (inboxOpened === true) {
            extension.windows.focus(inboxWindowId, function (error) {
                if (error) {
                    inboxOpened = false;
                    openInbox();
                }
            });
        }
    };

    window.setUnreadCount = function(count) {
        if (count > 0) {
            extension.navigator.setBadgeText(count);
            if (inboxOpened === true && appWindow) {
                appWindow.contentWindow.document.title = "Signal (" + count + ")";
            }
        } else {
            extension.navigator.setBadgeText("");
            if (inboxOpened === true && appWindow) {
                appWindow.contentWindow.document.title = "Signal";
            }
        }
    };

    var open;
    window.openConversation = function(conversation) {
        if (inboxOpened === true) {
            owsDesktopApp.openConversation(conversation);
        } else {
            open = conversation;
        }
        openInbox();
    };
    window.getOpenConversation = function() {
        var o = open;
        open = null;
        return o;
    };
})();
