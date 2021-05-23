(function () {
    'use strict';

    window.app = window.app || {};
    const exports = window.app.version = {};

    const semver = require('semver');

    exports.isBeta = version => semver.parse(version).prerelease[0] === 'beta';
})();