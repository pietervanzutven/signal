(function () {
  'use strict';

  const { take } = window.lodash;
  const { getRecentEmojis } = window.ts.sql.Client.default;

  window.emojis = {
    getInitialState,
    load,
  };

  let initialState = null;

  async function load() {
    const recents = await getRecentEmojisForRedux();

    initialState = {
      recents: take(recents, 32),
    };
  }

  async function getRecentEmojisForRedux() {
    const recent = await getRecentEmojis();
    return recent.map(e => e.shortName);
  }

  function getInitialState() {
    return initialState;
  }
})();