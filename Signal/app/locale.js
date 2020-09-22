(function () {
  'use strict';

  const path = window.path;
  const fs = window.fs;
  const _ = window.lodash;

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

    const targetFile = path.join(
      '_locales',
      onDiskLocale,
      'messages.json'
    );

    var xhr = new XMLHttpRequest();
    xhr.open("GET", targetFile, false);
    xhr.send(null);

    return JSON.parse(xhr.response);
  }

  function load({ appLocale, logger } = {}) {
    if (!appLocale) {
      throw new TypeError('`appLocale` is required');
    }

    if (!logger || !logger.error) {
      throw new TypeError('`logger.error` is required');
    }

    const english = getLocaleMessages('en');

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
      messages = _.merge(english, messages);
    } catch (e) {
      logger.error(
        `Problem loading messages for locale ${localeName} ${e.stack}`
      );
      logger.error('Falling back to en locale');

      localeName = 'en';
      messages = english;
    }

    return {
      name: localeName,
      messages,
    };
  }

  window.loadLocale = load;
})();