(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.LeftPane = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_measure_1 = __importDefault(require("react-measure"));
    const react_1 = __importDefault(require("react"));
    const react_virtualized_1 = require("react-virtualized");
    const lodash_1 = require("lodash");
    const ConversationListItem_1 = require("./ConversationListItem");
    const SearchResults_1 = require("./SearchResults");
    const _util_1 = require("./_util");
    var RowType;
    (function (RowType) {
        RowType[RowType["ArchiveButton"] = 0] = "ArchiveButton";
        RowType[RowType["ArchivedConversation"] = 1] = "ArchivedConversation";
        RowType[RowType["Conversation"] = 2] = "Conversation";
        RowType[RowType["Header"] = 3] = "Header";
        RowType[RowType["PinnedConversation"] = 4] = "PinnedConversation";
        RowType[RowType["Undefined"] = 5] = "Undefined";
    })(RowType = exports.RowType || (exports.RowType = {}));
    var HeaderType;
    (function (HeaderType) {
        HeaderType[HeaderType["Pinned"] = 0] = "Pinned";
        HeaderType[HeaderType["Chats"] = 1] = "Chats";
    })(HeaderType = exports.HeaderType || (exports.HeaderType = {}));
    class LeftPane extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.listRef = react_1.default.createRef();
            this.containerRef = react_1.default.createRef();
            this.setFocusToFirstNeeded = false;
            this.setFocusToLastNeeded = false;
            this.calculateRowHeight = ({ index }) => {
                const { type } = this.getRowFromIndex(index);
                return type === RowType.Header ? 40 : 68;
            };
            this.getRowFromIndex = (index) => {
                const { archivedConversations, conversations, pinnedConversations, showArchived, } = this.props;
                if (!conversations || !pinnedConversations || !archivedConversations) {
                    return {
                        type: RowType.Undefined,
                    };
                }
                if (showArchived) {
                    return {
                        index,
                        type: RowType.ArchivedConversation,
                    };
                }
                let conversationIndex = index;
                if (pinnedConversations.length) {
                    if (conversations.length) {
                        if (index === 0) {
                            return {
                                headerType: HeaderType.Pinned,
                                type: RowType.Header,
                            };
                        }
                        if (index <= pinnedConversations.length) {
                            return {
                                index: index - 1,
                                type: RowType.PinnedConversation,
                            };
                        }
                        if (index === pinnedConversations.length + 1) {
                            return {
                                headerType: HeaderType.Chats,
                                type: RowType.Header,
                            };
                        }
                        conversationIndex -= pinnedConversations.length + 2;
                    }
                    else if (index < pinnedConversations.length) {
                        return {
                            index,
                            type: RowType.PinnedConversation,
                        };
                    }
                    else {
                        conversationIndex = 0;
                    }
                }
                if (conversationIndex === conversations.length) {
                    return {
                        type: RowType.ArchiveButton,
                    };
                }
                return {
                    index: conversationIndex,
                    type: RowType.Conversation,
                };
            };
            this.renderHeaderRow = (index, key, style) => {
                const { i18n } = this.props;
                switch (index) {
                    case HeaderType.Pinned: {
                        return (react_1.default.createElement("div", { className: "module-left-pane__header-row", key: key, style: style }, i18n('LeftPane--pinned')));
                    }
                    case HeaderType.Chats: {
                        return (react_1.default.createElement("div", { className: "module-left-pane__header-row", key: key, style: style }, i18n('LeftPane--chats')));
                    }
                    default: {
                        window.log.warn('LeftPane: invalid HeaderRowIndex received');
                        return react_1.default.createElement(react_1.default.Fragment, null);
                    }
                }
            };
            this.renderRow = ({ index, key, style, }) => {
                const { archivedConversations, conversations, pinnedConversations, } = this.props;
                if (!conversations || !pinnedConversations || !archivedConversations) {
                    throw new Error('renderRow: Tried to render without conversations or pinnedConversations or archivedConversations');
                }
                const row = this.getRowFromIndex(index);
                switch (row.type) {
                    case RowType.ArchiveButton: {
                        return this.renderArchivedButton(key, style);
                    }
                    case RowType.ArchivedConversation: {
                        return this.renderConversationRow(archivedConversations[row.index], key, style);
                    }
                    case RowType.Conversation: {
                        return this.renderConversationRow(conversations[row.index], key, style);
                    }
                    case RowType.Header: {
                        return this.renderHeaderRow(row.headerType, key, style);
                    }
                    case RowType.PinnedConversation: {
                        return this.renderConversationRow(pinnedConversations[row.index], key, style);
                    }
                    default:
                        window.log.warn('LeftPane: unknown RowType received');
                        return react_1.default.createElement(react_1.default.Fragment, null);
                }
            };
            this.renderArchivedButton = (key, style) => {
                const { archivedConversations, i18n, showArchivedConversations, } = this.props;
                if (!archivedConversations || !archivedConversations.length) {
                    throw new Error('renderArchivedButton: Tried to render without archivedConversations');
                }
                return (react_1.default.createElement("button", { key: key, className: "module-left-pane__archived-button", style: style, onClick: showArchivedConversations, type: "button" },
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
            this.recomputeRowHeights = () => {
                if (!this.listRef || !this.listRef.current) {
                    return;
                }
                this.listRef.current.recomputeRowHeights();
            };
            this.getScrollContainer = () => {
                if (!this.listRef || !this.listRef.current) {
                    return null;
                }
                const list = this.listRef.current;
                // TODO: DESKTOP-689
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const grid = list.Grid;
                if (!grid || !grid._scrollingContainer) {
                    return null;
                }
                return grid._scrollingContainer;
            };
            this.setFocusToFirst = () => {
                const scrollContainer = this.getScrollContainer();
                if (!scrollContainer) {
                    return;
                }
                const item = scrollContainer.querySelector('.module-conversation-list-item');
                if (item && item.focus) {
                    item.focus();
                }
            };
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
                    const button = scrollContainer.querySelector('.module-left-pane__archived-button');
                    if (button && button.focus) {
                        button.focus();
                        return;
                    }
                    const items = scrollContainer.querySelectorAll('.module-conversation-list-item');
                    if (items && items.length > 0) {
                        const last = items[items.length - 1];
                        if (last && last.focus) {
                            last.focus();
                        }
                    }
                }
            }, 100, { maxWait: 100 });
            this.getLength = () => {
                const { archivedConversations, conversations, pinnedConversations, showArchived, } = this.props;
                if (!conversations || !archivedConversations || !pinnedConversations) {
                    return 0;
                }
                if (showArchived) {
                    return archivedConversations.length;
                }
                let { length } = conversations;
                if (pinnedConversations.length) {
                    if (length) {
                        // includes two additional rows for pinned/chats headers
                        length += 2;
                    }
                    length += pinnedConversations.length;
                }
                // includes one additional row for 'archived conversations' button
                if (archivedConversations.length) {
                    length += 1;
                }
                return length;
            };
            this.renderList = ({ height, width, }) => {
                const { archivedConversations, i18n, conversations, openConversationInternal, pinnedConversations, renderMessageSearchResult, startNewConversation, searchResults, showArchived, } = this.props;
                if (searchResults) {
                    return (react_1.default.createElement(SearchResults_1.SearchResults, Object.assign({}, searchResults, { height: height || 0, width: width || 0, openConversationInternal: openConversationInternal, startNewConversation: startNewConversation, renderMessageSearchResult: renderMessageSearchResult, i18n: i18n })));
                }
                if (!conversations || !archivedConversations || !pinnedConversations) {
                    throw new Error('render: must provided conversations and archivedConverstions if no search results are provided');
                }
                const length = this.getLength();
                // We ensure that the listKey differs between inbox and archive views, which ensures
                //   that AutoSizer properly detects the new size of its slot in the flexbox. The
                //   archive explainer text at the top of the archive view causes problems otherwise.
                //   It also ensures that we scroll to the top when switching views.
                const listKey = showArchived ? 1 : 0;
                // Note: conversations is not a known prop for List, but it is required to ensure that
                //   it re-renders when our conversation data changes. Otherwise it would just render
                //   on startup and scroll.
                return (react_1.default.createElement("div", { "aria-live": "polite", className: "module-left-pane__list", key: listKey, onFocus: this.handleFocus, onKeyDown: this.handleKeyDown, ref: this.containerRef, role: "presentation", tabIndex: -1 },
                    react_1.default.createElement(react_virtualized_1.List, { className: "module-left-pane__virtual-list", conversations: conversations, height: height || 0, onScroll: this.onScroll, ref: this.listRef, rowCount: length, rowHeight: this.calculateRowHeight, rowRenderer: this.renderRow, tabIndex: -1, width: width || 0 })));
            };
            this.renderArchivedHeader = () => {
                const { i18n, showInbox } = this.props;
                return (react_1.default.createElement("div", { className: "module-left-pane__archive-header" },
                    react_1.default.createElement("button", { onClick: showInbox, className: "module-left-pane__to-inbox-button", title: i18n('backToInbox'), "aria-label": i18n('backToInbox'), type: "button" }),
                    react_1.default.createElement("div", { className: "module-left-pane__archive-header-text" }, i18n('archivedConversations'))));
            };
        }
        renderConversationRow(conversation, key, style) {
            const { i18n, openConversationInternal } = this.props;
            return (react_1.default.createElement("div", { key: key, className: "module-left-pane__conversation-container", style: style },
                react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({}, conversation, { onClick: openConversationInternal, i18n: i18n }))));
        }
        render() {
            const { i18n, renderExpiredBuildDialog, renderMainHeader, renderNetworkStatus, renderRelinkDialog, renderUpdateDialog, showArchived, } = this.props;
            // Relying on 3rd party code for contentRect.bounds
            /* eslint-disable @typescript-eslint/no-non-null-assertion */
            return (react_1.default.createElement("div", { className: "module-left-pane" },
                react_1.default.createElement("div", { className: "module-left-pane__header" }, showArchived ? this.renderArchivedHeader() : renderMainHeader()),
                renderExpiredBuildDialog(),
                renderRelinkDialog(),
                renderNetworkStatus(),
                renderUpdateDialog(),
                showArchived && (react_1.default.createElement("div", { className: "module-left-pane__archive-helper-text", key: 0 }, i18n('archiveHelperText'))),
                react_1.default.createElement(react_measure_1.default, { bounds: true }, ({ contentRect, measureRef }) => (react_1.default.createElement("div", { className: "module-left-pane__list--measure", ref: measureRef },
                    react_1.default.createElement("div", { className: "module-left-pane__list--wrapper" }, this.renderList(contentRect.bounds)))))));
        }
        componentDidUpdate(oldProps) {
            const { conversations: oldConversations = [], pinnedConversations: oldPinnedConversations = [], archivedConversations: oldArchivedConversations = [], showArchived: oldShowArchived, } = oldProps;
            const { conversations: newConversations = [], pinnedConversations: newPinnedConversations = [], archivedConversations: newArchivedConversations = [], showArchived: newShowArchived, } = this.props;
            const oldHasArchivedConversations = Boolean(oldArchivedConversations.length);
            const newHasArchivedConversations = Boolean(newArchivedConversations.length);
            // This could probably be optimized further, but we want to be extra-careful that our
            //   heights are correct.
            if (oldConversations.length !== newConversations.length ||
                oldPinnedConversations.length !== newPinnedConversations.length ||
                oldHasArchivedConversations !== newHasArchivedConversations ||
                oldShowArchived !== newShowArchived) {
                this.recomputeRowHeights();
            }
        }
    }
    exports.LeftPane = LeftPane;
})();