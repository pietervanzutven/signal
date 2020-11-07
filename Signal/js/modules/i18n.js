/* eslint-env node */
/* global log */

(function () {
  'use strict';

  window.modules = window.modules || {};
  const exports = window.modules.i18n = {};

  exports.setup = (locale, messages) => {
    if (!locale) {
      throw new Error('i18n: locale parameter is required');
    }
    if (!messages) {
      throw new Error('i18n: messages parameter is required');
    }

    function getMessage(key, substitutions) {
      const entry = messages[key];
      if (!entry) {
        log.error(
          `i18n: Attempted to get translation for nonexistent key '${key}'`
        );
        return '';
      }

      const { message } = entry;
      if (Array.isArray(substitutions)) {
        return substitutions.reduce(
          (result, substitution) => result.replace(/\$.+?\$/, substitution),
          message
        );
      } else if (substitutions) {
        return message.replace(/\$.+?\$/, substitutions);
      }

      return message;
    }

    getMessage.getLocale = () => locale;

    return getMessage;
  };
})();