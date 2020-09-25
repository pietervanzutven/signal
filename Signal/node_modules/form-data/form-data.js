(function () {
    window.form_data = function () {
        this.formData = Windows.Web.Http.HttpMultipartFormDataContent();
        this.append = function (key, value) {
            var httpContent = Windows.Web.Http.HttpStringContent(value);
            this.formData.add(httpContent);
        }
        this.submit = async function (url) {
            var httpClient = Windows.Web.Http.HttpClient();
            response = await httpClient.postAsync(new Windows.Foundation.Uri(url), this.formData);
        }
    }
})();