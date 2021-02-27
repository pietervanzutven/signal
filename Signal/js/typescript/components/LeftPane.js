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
    const lodash_1 = window.lodash;
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const SearchResults_1 = window.ts.components.SearchResults;
    const _util_1 = window.ts.components._util;
    class LeftPane extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.listRef = react_1.default.createRef();
            this.containerRef = react_1.default.createRef();
            this.setFocusToFirstNeeded = false;
            this.setFocusToLastNeeded = false;
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
            this.renderArchivedButton = ({ key, style, }) => {
                const { archivedConversations, i18n, showArchivedConversations, } = this.props;
                if (!archivedConversations || !archivedConversations.length) {
                    throw new Error('renderArchivedButton: Tried to render without archivedConversations');
                }
                return (react_1.default.createElement("button", { key: key, className: "module-left-pane__archived-button", style: style, onClick: showArchivedConversations },
                    i18n('archivedConversations'),
                    ' ',
                    react_1.default.createElement("span", { className: "module-left-pane__archived-button__archived-count" }, archivedConversations.length)));
            };
            this.handleKeyDown = (event) => {
                const commandKey = lodash_1.get(window, 'platform') === 'darwin' && event.metaKey;
                const controlKey = lodash_1.get(window, 'platform') !== 'darwin' && event.ctrlKey;
                const commandOrCtrl = commandKey || controlKey;
                if (commandOrCtrl && !event.shiftKey && event.key === 'ArrowUp') {
                    this.scrollToRow(0);
                    this.setFocusToFirstNeeded = true;
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (commandOrCtrl && !event.shiftKey && event.key === 'ArrowDown') {
                    const length = this.getLength();
                    this.scrollToRow(length - 1);
                    this.setFocusToLastNeeded = true;
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            };
            this.handleFocus = () => {
                const { selectedConversationId } = this.props;
                const { current: container } = this.containerRef;
                if (!container) {
                    return;
                }
                if (document.activeElement === container) {
                    const scrollingContainer = this.getScrollContainer();
                    if (selectedConversationId && scrollingContainer) {
                        const escapedId = _util_1.cleanId(selectedConversationId).replace(/["\\]/g, '\\$&');
                        // tslint:disable-next-line no-unnecessary-type-assertion
                        const target = scrollingContainer.querySelector(`.module-conversation-list-item[data-id="${escapedId}"]`);
                        if (target && target.focus) {
                            target.focus();
                            return;
                        }
                    }
                    this.setFocusToFirst();
                }
            };
            this.scrollToRow = (row) => {
                if (!this.listRef || !this.listRef.current) {
                    return;
                }
                this.listRef.current.scrollToRow(row);
            };
            this.getScrollContainer = () => {
                if (!this.listRef || !this.listRef.current) {
                    return;
                }
                const list = this.listRef.current;
                if (!list.Grid || !list.Grid._scrollingContainer) {
                    return;
                }
                return list.Grid._scrollingContainer;
            };
            this.setFocusToFirst = () => {
                const scrollContainer = this.getScrollContainer();
                if (!scrollContainer) {
                    return;
                }
                // tslint:disable-next-line no-unnecessary-type-assertion
                const item = scrollContainer.querySelector('.module-conversation-list-item');
                if (item && item.focus) {
                    item.focus();
                    return;
                }
            };
            // tslint:disable-next-line member-ordering
            this.onScroll = lodash_1.debounce(() => {
                if (this.setFocusToFirstNeeded) {
                    this.setFocusToFirstNeeded = false;
                    this.setFocusToFirst();
                }
                if (this.setFocusToLastNeeded) {
                    this.setFocusToLastNeeded = false;
                    const scrollContainer = this.getScrollContainer();
                    if (!scrollContainer) {
                        return;
                    }
                    // tslint:disable-next-line no-unnecessary-type-assertion
                    const button = scrollContainer.querySelector('.module-left-pane__archived-button');
                    if (button && button.focus) {
                        button.focus();
                        return;
                    }
                    // tslint:disable-next-line no-unnecessary-type-assertion
                    const items = scrollContainer.querySelectorAll('.module-conversation-list-item');
                    if (items && items.length > 0) {
                        const last = items[items.length - 1];
                        if (last && last.focus) {
                            last.focus();
                            return;
                        }
                    }
                }
            }, 100, { maxWait: 100 });
            this.getLength = () => {
                const { archivedConversations, conversations, showArchived } = this.props;
                if (!conversations || !archivedConversations) {
                    return 0;
                }
                // That extra 1 element added to the list is the 'archived conversations' button
                return showArchived
                    ? archivedConversations.length
                    : conversations.length + (archivedConversations.length ? 1 : 0);
            };
            this.renderList = () => {
                const { archivedConversations, i18n, conversations, openConversationInternal, renderMessageSearchResult, startNewConversation, searchResults, showArchived, } = this.props;
                if (searchResults) {
                    return (react_1.default.createElement(SearchResults_1.SearchResults, Object.assign({}, searchResults, { openConversationInternal: openConversationInternal, startNewConversation: startNewConversation, renderMessageSearchResult: renderMessageSearchResult, i18n: i18n })));
                }
                if (!conversations || !archivedConversations) {
                    throw new Error('render: must provided conversations and archivedConverstions if no search results are provided');
                }
                const length = this.getLength();
                const archived = showArchived ? (react_1.default.createElement("div", { className: "module-left-pane__archive-helper-text", key: 0 }, i18n('archiveHelperText'))) : null;
                // We ensure that the listKey differs between inbox and archive views, which ensures
                //   that AutoSizer properly detects the new size of its slot in the flexbox. The
                //   archive explainer text at the top of the archive view causes problems otherwise.
                //   It also ensures that we scroll to the top when switching views.
                const listKey = showArchived ? 1 : 0;
                // Note: conversations is not a known prop for List, but it is required to ensure that
                //   it re-renders when our conversation data changes. Otherwise it would just render
                //   on startup and scroll.
                const list = (react_1.default.createElement("div", { className: "module-left-pane__list", key: listKey, "aria-live": "polite", role: "group", tabIndex: -1, ref: this.containerRef, onKeyDown: this.handleKeyDown, onFocus: this.handleFocus },
                    react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => (react_1.default.createElement(react_virtualized_1.List, { ref: this.listRef, onScroll: this.onScroll, className: "module-left-pane__virtual-list", conversations: conversations, height: height, rowCount: length, rowHeight: 68, tabIndex: -1, rowRenderer: this.renderRow, width: width })))));
                return [archived, list];
            };
            this.renderArchivedHeader = () => {
                const { i18n, showInbox } = this.props;
                return (react_1.default.createElement("div", { className: "module-left-pane__archive-header" },
                    react_1.default.createElement("button", { onClick: showInbox, className: "module-left-pane__to-inbox-button", title: i18n('backToInbox') }),
                    react_1.default.createElement("div", { className: "module-left-pane__archive-header-text" }, i18n('archivedConversations'))));
            };
        }
        render() {
            const { renderExpiredBuildDialog, renderMainHeader, renderNetworkStatus, renderUpdateDialog, showArchived, } = this.props;
            return (react_1.default.createElement("div", { className: "module-left-pane" },
                react_1.default.createElement("div", { className: "module-left-pane__header" }, showArchived ? this.renderArchivedHeader() : renderMainHeader()),
                renderExpiredBuildDialog(),
                renderNetworkStatus(),
                renderUpdateDialog(),
                this.renderList()));
        }
    }
    exports.LeftPane = LeftPane;
})();