(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.LeftPane = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const react_virtualized_1 = window.react_virtualized;
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const SearchResults_1 = window.ts.components.SearchResults;
    class LeftPane extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.renderRow = ({ index, key, style }) => {
                const { conversations, i18n, openConversationInternal } = this.props;
                if (!conversations) {
                    return null;
                }
                const conversation = conversations[index];
                return (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: key, style: style }, conversation, { onClick: openConversationInternal, i18n: i18n })));
            };
        }
        renderList() {
            const { i18n, conversations, openConversationInternal, startNewConversation, searchResults, } = this.props;
            if (searchResults) {
                return (react_1.default.createElement(SearchResults_1.SearchResults, Object.assign({}, searchResults, { openConversation: openConversationInternal, startNewConversation: startNewConversation, i18n: i18n })));
            }
            if (!conversations || !conversations.length) {
                return null;
            }
            // Note: conversations is not a known prop for List, but it is required to ensure that
            //   it re-renders when our conversation data changes. Otherwise it would just render
            //   on startup and scroll.
            return (react_1.default.createElement("div", { className: "module-left-pane__list" },
                react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => (react_1.default.createElement(react_virtualized_1.List, { className: "module-left-pane__virtual-list", conversations: conversations, height: height, rowCount: conversations.length, rowHeight: 64, rowRenderer: this.renderRow, width: width })))));
        }
        render() {
            const { renderMainHeader } = this.props;
            return (react_1.default.createElement("div", { className: "module-left-pane" },
                react_1.default.createElement("div", { className: "module-left-pane__header" }, renderMainHeader()),
                this.renderList()));
        }
    }
    exports.LeftPane = LeftPane;
})();