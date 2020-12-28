(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.state = window.ts.state || {};
    window.ts.state.smart = window.ts.state.smart || {};
    const exports = window.ts.state.smart.EmojiButton = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const react_redux_1 = window.react_redux;
    const reselect_1 = window.reselect;
    const lodash_1 = window.lodash;
    const actions_1 = window.ts.state.actions;
    const EmojiButton_1 = window.ts.components.emoji.EmojiButton;
    const user_1 = window.ts.state.selectors.user;
    const mapStateToProps = (state) => {
        const { recents } = state.emojis;
        return {
            i18n: user_1.getIntl(state),
            recentEmojis: recents,
            skinTone: lodash_1.get(state, ['items', 'skinTone', 'value'], 0),
        };
    };
    const dispatchPropsMap = Object.assign({}, actions_1.mapDispatchToProps, { onSetSkinTone: (tone) => actions_1.mapDispatchToProps.putItem('skinTone', tone) });
    const selectOnPickEmoji = reselect_1.createSelector((onPickEmoji) => onPickEmoji, (_onPickEmoji, useEmoji) => useEmoji, (onPickEmoji, useEmoji) => e => {
        onPickEmoji(e);
        useEmoji(e.shortName);
    });
    const mergeProps = (stateProps, dispatchProps, ownProps) => (Object.assign({}, ownProps, stateProps, dispatchProps, { onPickEmoji: selectOnPickEmoji(ownProps.onPickEmoji, dispatchProps.useEmoji) }));
    const smart = react_redux_1.connect(mapStateToProps, dispatchPropsMap, mergeProps);
    exports.SmartEmojiButton = smart(EmojiButton_1.EmojiButton);
})();