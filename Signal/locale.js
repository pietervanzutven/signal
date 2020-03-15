locale = {
    normalizeLocaleName: function (locale) {
        if (/^en-/.test(locale)) {
            return 'en';
        }

        return locale;
    },

    getLocaleMessages: function (locale) {
        const onDiskLocale = locale.replace('-','_');
        const targetFile = '_locales/' + onDiskLocale + '/messages.json';

        if(window.$) {
            $.getJSON(targetFile,function(localeData) {
                window.config.localeMessages = localeData;
            });
        }
    }
}