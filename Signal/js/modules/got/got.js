(function () {
    window.got = {
        get: async url => {
            var httpClient = Windows.Web.Http.HttpClient();
            var httpResponse = await httpClient.getAsync(new Windows.Foundation.Uri(url));
            var response = await httpResponse.content.readAsStringAsync();
            return {body: JSON.parse(response)};
        }
    }
})()