(function () {
  'use strict';

  const { take } = window.lodash;
  const { getRecentEmojis } = window.data;
  const { replaceColons } = window.ts.components.emoji.lib;

  window.emojis = {
    getInitialState,
    load,
    replaceColons,
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