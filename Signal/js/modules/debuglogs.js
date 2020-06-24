/* eslint-env node */

(function() {
    const FormData = window.form_data;
    const got = window.got;


    const BASE_URL = 'https://debuglogs.org';

    // Workaround: Submitting `FormData` using native `FormData::submit` procedure
    // as integration with `got` results in S3 error saying we haven’t set the
    // `Content-Length` header:
    const submitFormData = (form, url) =>
        new Promise((resolve, reject) => {
            form.submit(url, (error) => {
                if (error) {
                    return reject(error);
                }

                return resolve();
            });
        });

    //      upload :: String -> Promise URL
    window.debuglogs = {
        upload: async (content) => {
            const signedForm = await got.get(BASE_URL, { json: true });
            const { fields, url } = signedForm.body;

            const form = new FormData();
            // The API expects `key` to be the first field:
            form.append('key', fields.key);

            Object.entries(fields)
              .filter(([key]) => key !== 'key')
              .forEach(([key, value]) => {
                  form.append(key, value);
              });

            const contentBuffer = Array.from([content]);
            const contentType = 'text/plain';
            form.append('Content-Type', contentType);
            form.append('file', contentBuffer, {
                contentType,
                filename: 'signal-desktop-debug-log.txt',
            });

            await submitFormData(form, url);

            return `${BASE_URL}/${fields.key}`;
        }
    }
})();