(function () {
    window.semver = window.semver || {};
    window.semver.functions = window.semver.functions || {};

    const SemVer = window.semver.classes.semver;
    const compare = (a, b, loose) =>
        new SemVer(a, loose).compare(new SemVer(b, loose))

    window.semver.functions.compare = compare
})();