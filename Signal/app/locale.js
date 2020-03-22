(function () {
    function normalizeLocaleName(locale) {
        if (/^es-/.test(locale)) {
            return /419/.test(locale) ? locale : 'es';
        }
        if (/^pt-/.test(locale)) {
            return /(BR|PT)/.test(locale) ? locale : 'pt-PT';
        }
        if (/^zh-/.test(locale)) {
            return /(CN|TW)/.test(locale) ? locale : 'zh-CN';
        }

        return locale.substring(0, 2);
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
        let english = getLocaleMessages('en');
        let appLocale = Windows.Globalization.ApplicationLanguages.languages[0];

        // Load locale - if we can't load messages for the current locale, we
        // default to 'en'
        //
        // possible locales:
        // https://github.com/electron/electron/blob/master/docs/api/locales.md
        let localeName = normalizeLocaleName(appLocale);
        let messages;

        try {
            messages = getLocaleMessages(localeName);

            // We start with english, then overwrite that with anything present in locale
            messages = Object.assign(english, messages);
        } catch (e) {
            logger.error('Problem loading messages for locale ' + localeName + ' ' + e.stack);
            logger.error('Falling back to en locale');

            localeName = 'en';
            messages = english;
        }

        return {
            name: localeName,
            messages
        };
    }

    window.loadLocale = load;
})()