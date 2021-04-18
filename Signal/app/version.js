(function () {
    'use strict';

    window.app = window.app || {};
    const exports = window.app.version = {};

    const semver = window.semver;

    exports.isBeta = version => semver.parse(version).prerelease[0] === 'beta';
})();