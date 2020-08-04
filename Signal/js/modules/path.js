(function () {
    window.path = {
        join: (path1, path2) => path1 === '' ? path2 : path1 + '/' + path2,
    }
})();