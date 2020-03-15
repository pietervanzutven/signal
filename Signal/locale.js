locale = {
    normalizeLocaleName: function (locale) {
        if (/^en-/.test(locale)) {
            return 'en';
        }

        return locale;
    },

    getLocaleMessages: function (locale) {
        const onDiskLocale = locale.replace('-', '_');
        const targetFile = '_locales/' + onDiskLocale + '/messages.json';

        var xhr = new XMLHttpRequest();
        xhr.open("GET", targetFile, false);
        xhr.send(null);

        return JSON.parse(xhr.response);
    }
}