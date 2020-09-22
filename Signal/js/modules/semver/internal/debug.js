(function () {
    window.semver = window.semver || {};
    window.semver.internal = window.semver.internal || {};

    const debug = (
      typeof process === 'object' &&
      process.env &&
      process.env.NODE_DEBUG &&
      /\bsemver\b/i.test(process.env.NODE_DEBUG)
    ) ? (...args) => console.error('SEMVER', ...args)
      : () => { }

    window.semver.internal.debug = debug;
})();