/* eslint-env node */

(function () {
    window.privacy = {};
    
    const Path = window.path;

    const {
        escapeRegExp,
        isRegExp,
        isString,
        } = window.lodash;
    const { compose } = window.lodash.fp;


    const PHONE_NUMBER_PATTERN = /\+\d{7,12}(\d{3})/g;
    const GROUP_ID_PATTERN = /(group\()([^)]+)(\))/g;

    const APP_ROOT_PATH = Path.join(__dirname, '..', '..', '..');
    const APP_ROOT_PATH_PATTERN = (() => {
        try {
            // Safe `String::replaceAll`:
            // https://github.com/lodash/lodash/issues/1084#issuecomment-86698786
            return new RegExp(escapeRegExp(APP_ROOT_PATH), 'g');
        } catch (error) {
            return null;
        }
    })();

    const REDACTION_PLACEHOLDER = '[REDACTED]';

    //      redactPhoneNumbers :: String -> String
    window.privacy.redactPhoneNumbers = (text) => {
        if (!isString(text)) {
            throw new TypeError('"text" must be a string');
        }

        return text.replace(PHONE_NUMBER_PATTERN, `+${REDACTION_PLACEHOLDER}$1`);
    };

    //      redactGroupIds :: String -> String
    window.privacy.redactGroupIds = (text) => {
        if (!isString(text)) {
            throw new TypeError('"text" must be a string');
        }

        return text.replace(
          GROUP_ID_PATTERN,
          (match, before, id, after) =>
              `${before}${REDACTION_PLACEHOLDER}${id.slice(-3)}${after}`
        );
    };

    //      redactSensitivePaths :: String -> String
    window.privacy.redactSensitivePaths = (text) => {
        if (!isString(text)) {
            throw new TypeError('"text" must be a string');
        }

        if (!isRegExp(APP_ROOT_PATH_PATTERN)) {
            return text;
        }

        return text.replace(APP_ROOT_PATH_PATTERN, REDACTION_PLACEHOLDER);
    };

    //      redactAll :: String -> String
    window.privacy.redactAll = compose(
      window.privacy.redactSensitivePaths,
      window.privacy.redactGroupIds,
      window.privacy.redactPhoneNumbers
    );
})();