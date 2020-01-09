/*
 * vim: ts=4:sw=4:expandtab
 */
(function () {
    'use strict';
    window.Whisper = window.Whisper || {};

    Whisper.DebugLogLinkView = Whisper.View.extend({
        templateName: 'debug-log-link',
        initialize: function(options) {
            this.url = options.url;
        },
        render_attributes: function() {
            return {
                url: this.url,
                reportIssue: i18n('reportIssue')
            };
        }
    });
    Whisper.DebugLogView = Whisper.View.extend({
        templateName: 'debug-log',
        className: 'debug-log modal',
        initialize: function() {
            this.render();
            this.$('textarea').val(debugLog.reverse().join('\n'));
        },
        events: {
            'click .submit': 'submit',
            'click .export': 'export',
            'click .import': 'import',
            'click .close': 'close'
        },
        render_attributes: {
            title: i18n('submitDebugLog'),
            cancel: i18n('cancel'),
            submit: i18n('submit'),
            export: i18n('export'),
            import: i18n('import'),
            close: i18n('gotIt'),
            debugLogExplanation: i18n('debugLogExplanation')
        },
        close: function(e) {
            e.preventDefault();
            this.remove();
        },
        submit: function(e) {
            e.preventDefault();
            var log = this.$('textarea').val();
            if (log.length === 0) {
                return;
            }
            console.post(log).then(function(url) {
                var view = new Whisper.DebugLogLinkView({
                    url: url,
                    el: this.$('.result')
                });
                this.$('.loading').removeClass('loading');
                view.render();
                this.$('.link').focus().select();
            }.bind(this));
            this.$('.buttons, textarea').remove();
            this.$('.result').addClass('loading');
        },
        import: function(e) {
            e.preventDefault();

            var picker = Windows.Storage.Pickers.FolderPicker();
            picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
            picker.fileTypeFilter.append("*");
            picker.pickSingleFolderAsync().then(
                function (folder) {
                    if (folder) {
                        folder.getFilesAsync().then(
                            function (files) {
                                files.forEach(
                                    function (file) {
                                        var fileName = file.name;
                                        if (fileName === 'messages.json' || fileName === 'conversations.json') {
                                            Windows.Storage.FileIO.readTextAsync(file).then(
                                                function (text) {
                                                    BBDB[fileName.replace('.json', '')] = parseJSON(text);
                                                }
                                            );
                                        }
                                        if (file.fileType === '.dat') {
                                            file.copyAsync(Windows.Storage.ApplicationData.current.localFolder, fileName, Windows.Storage.NameCollisionOption.replaceExisting);
                                        }
                                    }.bind(this)
                                );
                            }.bind(this)
                        );
                    }
                }.bind(this)
            );
        },
        export: function(e) {
            e.preventDefault();

            Windows.Storage.ApplicationData.current.localFolder.createFileAsync('conversations.json', Windows.Storage.CreationCollisionOption.openIfExists).then(
                function (file) {
                    Windows.Storage.FileIO.writeTextAsync(file, stringifyJSON(BBDB.conversations)).then(
                        function () {
                            Windows.Storage.ApplicationData.current.localFolder.createFileAsync('messages.json', Windows.Storage.CreationCollisionOption.openIfExists).then(
                                function (file) {
                                    Windows.Storage.FileIO.writeTextAsync(file, stringifyJSON(BBDB.messages)).then(
                                        function () {
                                            var picker = Windows.Storage.Pickers.FolderPicker();
                                            picker.SuggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.documentsLibrary;
                                            picker.fileTypeFilter.append("*");
                                            picker.pickSingleFolderAsync().then(
                                                function (folder) {
                                                    if (folder) {
                                                        Windows.Storage.ApplicationData.current.localFolder.getFilesAsync().then(
                                                            function (files) {
                                                                files.forEach(
                                                                    function (file) {
                                                                        if (file.name !== 'BBDB.json') {
                                                                            file.copyAsync(folder, file.name, Windows.Storage.NameCollisionOption.replaceExisting);
                                                                        }
                                                                    }
                                                                );
                                                            }
                                                        );
                                                    }
                                                }
                                            );
                                        }
                                    );
                                }
                            );
                        }
                    );
                }
            );
        }
    });

})();
