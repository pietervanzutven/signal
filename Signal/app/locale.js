﻿(function () {
    function normalizeLocaleName(locale) {
        if (/^en-/.test(locale)) {
            return 'en';
        }

        return locale;
    }

    function getLocaleMessages(locale) {
        const onDiskLocale = locale.replace('-', '_');
        const targetFile = '_locales/' + onDiskLocale + '/messages.json';

        var xhr = new XMLHttpRequest();
        xhr.open("GET", targetFile, false);
        xhr.send(null);

        return JSON.parse(xhr.response);
    }

    function load() {
        // Load locale - if we can't load messages for the current locale, we
        // default to 'en'
        //
        // possible locales:
        // https://github.com/electron/electron/blob/master/docs/api/locales.md
        let localeName = normalizeLocaleName(Windows.Globalization.ApplicationLanguages.languages[0]);
        let messages;

        try {
            messages = getLocaleMessages(localeName);
        } catch (e) {
            console.log('Problem loading messages for locale ', localeName, e.stack);
            console.log('Falling back to en locale');

            localeName = 'en';
            messages = getLocaleMessages(localeName);
        }

        return {
            name: localeName,
            messages
        };
    }

    window.loadLocale = load;
})()