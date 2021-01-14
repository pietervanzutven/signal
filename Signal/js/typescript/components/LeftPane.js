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
            this.renderRow = ({ index, key, style, }) => {
                const { archivedConversations, conversations, i18n, openConversationInternal, showArchived, } = this.props;
                if (!conversations || !archivedConversations) {
                    throw new Error('renderRow: Tried to render without conversations or archivedConversations');
                }
                if (!showArchived && index === conversations.length) {
                    return this.renderArchivedButton({ key, style });
                }
                const conversation = showArchived
                    ? archivedConversations[index]
                    : conversations[index];
                return (react_1.default.createElement("div", { key: key, className: "module-left-pane__conversation-container", style: style },
                    react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({}, conversation, { onClick: openConversationInternal, i18n: i18n }))));
            };
        }
        renderArchivedButton({ key, style, }) {
            const { archivedConversations, i18n, showArchivedConversations, } = this.props;
            if (!archivedConversations || !archivedConversations.length) {
                throw new Error('renderArchivedButton: Tried to render without archivedConversations');
            }
            return (react_1.default.createElement("div", { key: key, className: "module-left-pane__archived-button", style: style, role: "button", onClick: showArchivedConversations },
                i18n('archivedConversations'),
                ' ',
                react_1.default.createElement("span", { className: "module-left-pane__archived-button__archived-count" }, archivedConversations.length)));
        }
        renderList() {
            const { archivedConversations, i18n, conversations, openConversationInternal, renderMessageSearchResult, startNewConversation, searchResults, showArchived, } = this.props;
            if (searchResults) {
                return (react_1.default.createElement(SearchResults_1.SearchResults, Object.assign({}, searchResults, { openConversationInternal: openConversationInternal, startNewConversation: startNewConversation, renderMessageSearchResult: renderMessageSearchResult, i18n: i18n })));
            }
            if (!conversations || !archivedConversations) {
                throw new Error('render: must provided conversations and archivedConverstions if no search results are provided');
            }
            // That extra 1 element added to the list is the 'archived converastions' button
            const length = showArchived
                ? archivedConversations.length
                : conversations.length + (archivedConversations.length ? 1 : 0);
            const archived = showArchived ? (react_1.default.createElement("div", { className: "module-left-pane__archive-helper-text", key: 0 }, i18n('archiveHelperText'))) : null;
            // We ensure that the listKey differs between inbox and archive views, which ensures
            //   that AutoSizer properly detects the new size of its slot in the flexbox. The
            //   archive explainer text at the top of the archive view causes problems otherwise.
            //   It also ensures that we scroll to the top when switching views.
            const listKey = showArchived ? 1 : 0;
            // Note: conversations is not a known prop for List, but it is required to ensure that
            //   it re-renders when our conversation data changes. Otherwise it would just render
            //   on startup and scroll.
            const list = (react_1.default.createElement("div", { className: "module-left-pane__list", key: listKey, "aria-live": "polite" },
                react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => (react_1.default.createElement(react_virtualized_1.List, { className: "module-left-pane__virtual-list", conversations: conversations, height: height, rowCount: length, rowHeight: 68, rowRenderer: this.renderRow, width: width })))));
            return [archived, list];
        }
        renderArchivedHeader() {
            const { i18n, showInbox } = this.props;
            return (react_1.default.createElement("div", { className: "module-left-pane__archive-header" },
                react_1.default.createElement("div", { role: "button", onClick: showInbox, className: "module-left-pane__to-inbox-button" }),
                react_1.default.createElement("div", { className: "module-left-pane__archive-header-text" }, i18n('archivedConversations'))));
        }
        render() {
            const { renderMainHeader, showArchived } = this.props;
            return (react_1.default.createElement("div", { className: "module-left-pane" },
                react_1.default.createElement("div", { className: "module-left-pane__header" }, showArchived ? this.renderArchivedHeader() : renderMainHeader()),
                this.renderList()));
        }
    }
    exports.LeftPane = LeftPane;
})();