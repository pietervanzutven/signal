(function () {
    window.semver = window.semver || {};
    window.semver.functions = window.semver.functions || {};

    const compare = window.semver.functions.compare;
    const gte = (a, b, loose) => compare(a, b, loose) >= 0
    window.semver.functions.gte = gte;
})();