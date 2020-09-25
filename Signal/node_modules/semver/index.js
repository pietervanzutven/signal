(function () {
    window.semver = window.semver || {};

    // just pre-load all the stuff that index.js lazily exports
    window.semver.gte = window.semver.functions.gte;
})();