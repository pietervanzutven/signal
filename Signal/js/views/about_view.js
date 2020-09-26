/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';
    window.Whisper = window.Whisper || {};

    Whisper.AboutView = Whisper.View.extend({
        templateName: 'about',
        className: 'about modal',
        initialize: function() {
            this.render();
        },
        events: {
            'click .close': 'close'
        },
        render_attributes: {
            about: i18n('aboutSignalDesktop'),
            version: window.getVersion(),
            states: window.getEnvironment() + ' - ' + window.getAppInstance()
        },
        close: function(e) {
            e.preventDefault();
            this.remove();
        },
    });

})();