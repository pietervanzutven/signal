(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.SearchResults = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const react_virtualized_1 = window.react_virtualized;
    const lodash_1 = window.lodash;
    const Intl_1 = window.ts.components.Intl;
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const Spinner_1 = window.ts.components.Spinner;
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const StartNewConversation_1 = window.ts.components.StartNewConversation;
    const _util_1 = window.ts.components._util;
    class SearchResults extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.setFocusToFirstNeeded = false;
            this.setFocusToLastNeeded = false;
            this.cellSizeCache = new react_virtualized_1.CellMeasurerCache({
                defaultHeight: 80,
                fixedWidth: true,
            });
            this.listRef = react_1.default.createRef();
            this.containerRef = react_1.default.createRef();
            this.state = {
                scrollToIndex: undefined,
            };
            this.handleStartNewConversation = () => {
                const { regionCode, searchTerm, startNewConversation } = this.props;
                startNewConversation(searchTerm, { regionCode });
            };
            this.handleKeyDown = (event) => {
                const { items } = this.props;
                const commandKey = lodash_1.get(window, 'platform') === 'darwin' && event.metaKey;
                const controlKey = lodash_1.get(window, 'platform') !== 'darwin' && event.ctrlKey;
                const commandOrCtrl = commandKey || controlKey;
                if (!items || items.length < 1) {
                    return;
                }
                if (commandOrCtrl && !event.shiftKey && event.key === 'ArrowUp') {
                    this.setState({ scrollToIndex: 0 });
                    this.setFocusToFirstNeeded = true;
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (commandOrCtrl && !event.shiftKey && event.key === 'ArrowDown') {
                    const lastIndex = items.length - 1;
                    this.setState({ scrollToIndex: lastIndex });
                    this.setFocusToLastNeeded = true;
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            };
            this.handleFocus = () => {
                const { selectedConversationId, selectedMessageId } = this.props;
                const { current: container } = this.containerRef;
                if (!container) {
                    return;
                }
                if (document.activeElement === container) {
                    const scrollingContainer = this.getScrollContainer();
                    // First we try to scroll to the selected message
                    if (selectedMessageId && scrollingContainer) {
                        // tslint:disable-next-line no-unnecessary-type-assertion
                        const target = scrollingContainer.querySelector(`.module-message-search-result[data-id="${selectedMessageId}"]`);
                        if (target && target.focus) {
                            target.focus();
                            return;
                        }
                    }
                    // Then we try for the selected conversation
                    if (selectedConversationId && scrollingContainer) {
                        const escapedId = _util_1.cleanId(selectedConversationId).replace(/["\\]/g, '\\$&');
                        // tslint:disable-next-line no-unnecessary-type-assertion
                        const target = scrollingContainer.querySelector(`.module-conversation-list-item[data-id="${escapedId}"]`);
                        if (target && target.focus) {
                            target.focus();
                            return;
                        }
                    }
                    // Otherwise we set focus to the first non-header item
                    this.setFocusToFirst();
                }
            };
            this.setFocusToFirst = () => {
                const { current: container } = this.containerRef;
                if (container) {
                    // tslint:disable-next-line no-unnecessary-type-assertion
                    const noResultsItem = container.querySelector('.module-search-results__no-results');
                    if (noResultsItem && noResultsItem.focus) {
                        noResultsItem.focus();
                        return;
                    }
                }
                const scrollContainer = this.getScrollContainer();
                if (!scrollContainer) {
                    return;
                }
                // tslint:disable-next-line no-unnecessary-type-assertion
                const startItem = scrollContainer.querySelector('.module-start-new-conversation');
                if (startItem && startItem.focus) {
                    startItem.focus();
                    return;
                }
                // tslint:disable-next-line no-unnecessary-type-assertion
                const conversationItem = scrollContainer.querySelector('.module-conversation-list-item');
                if (conversationItem && conversationItem.focus) {
                    conversationItem.focus();
                    return;
                }
                // tslint:disable-next-line no-unnecessary-type-assertion
                const messageItem = scrollContainer.querySelector('.module-message-search-result');
                if (messageItem && messageItem.focus) {
                    messageItem.focus();
                    return;
                }
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
            // tslint:disable-next-line member-ordering
            this.onScroll = lodash_1.debounce(
                // tslint:disable-next-line cyclomatic-complexity
                (data) => {
                    // Ignore scroll events generated as react-virtualized recursively scrolls and
                    //   re-measures to get us where we want to go.
                    if (lodash_1.isNumber(data.scrollToRow) &&
                        data.scrollToRow >= 0 &&
                        !data._hasScrolledToRowTarget) {
                        return;
                    }
                    this.setState({ scrollToIndex: undefined });
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
                        const messageItems = scrollContainer.querySelectorAll('.module-message-search-result');
                        if (messageItems && messageItems.length > 0) {
                            const last = messageItems[messageItems.length - 1];
                            if (last && last.focus) {
                                last.focus();
                                return;
                            }
                        }
                        const contactItems = scrollContainer.querySelectorAll('.module-conversation-list-item');
                        if (contactItems && contactItems.length > 0) {
                            const last = contactItems[contactItems.length - 1];
                            if (last && last.focus) {
                                last.focus();
                                return;
                            }
                        }
                        const startItem = scrollContainer.querySelectorAll('.module-start-new-conversation');
                        if (startItem && startItem.length > 0) {
                            const last = startItem[startItem.length - 1];
                            if (last && last.focus) {
                                last.focus();
                                return;
                            }
                        }
                    }
                }, 100, { maxWait: 100 });
            this.renderRow = ({ index, key, parent, style, }) => {
                const { items, width } = this.props;
                const row = items[index];
                return (react_1.default.createElement("div", { role: "row", key: key, style: style },
                    react_1.default.createElement(react_virtualized_1.CellMeasurer, { cache: this.cellSizeCache, columnIndex: 0, key: key, parent: parent, rowIndex: index, width: width }, this.renderRowContents(row))));
            };
            this.getList = () => {
                if (!this.listRef) {
                    return;
                }
                const { current } = this.listRef;
                return current;
            };
            this.recomputeRowHeights = (row) => {
                const list = this.getList();
                if (!list) {
                    return;
                }
                list.recomputeRowHeights(row);
            };
            this.resizeAll = () => {
                this.cellSizeCache.clearAll();
                this.recomputeRowHeights(0);
            };
        }
        renderRowContents(row) {
            const { searchTerm, i18n, openConversationInternal, renderMessageSearchResult, } = this.props;
            if (row.type === 'start-new-conversation') {
                return (react_1.default.createElement(StartNewConversation_1.StartNewConversation, { phoneNumber: searchTerm, i18n: i18n, onClick: this.handleStartNewConversation }));
            }
            else if (row.type === 'sms-mms-not-supported-text') {
                return (react_1.default.createElement("div", { className: "module-search-results__sms-not-supported" }, i18n('notSupportedSMS')));
            }
            else if (row.type === 'conversations-header') {
                return (react_1.default.createElement("div", { className: "module-search-results__conversations-header", role: "heading", "aria-level": 1 }, i18n('conversationsHeader')));
            }
            else if (row.type === 'conversation') {
                const { data } = row;
                return (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: data.phoneNumber }, data, { onClick: openConversationInternal, i18n: i18n })));
            }
            else if (row.type === 'contacts-header') {
                return (react_1.default.createElement("div", { className: "module-search-results__contacts-header", role: "heading", "aria-level": 1 }, i18n('contactsHeader')));
            }
            else if (row.type === 'contact') {
                const { data } = row;
                return (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: data.phoneNumber }, data, { onClick: openConversationInternal, i18n: i18n })));
            }
            else if (row.type === 'messages-header') {
                return (react_1.default.createElement("div", { className: "module-search-results__messages-header", role: "heading", "aria-level": 1 }, i18n('messagesHeader')));
            }
            else if (row.type === 'message') {
                const { data } = row;
                return renderMessageSearchResult(data);
            }
            else if (row.type === 'spinner') {
                return (react_1.default.createElement("div", { className: "module-search-results__spinner-container" },
                    react_1.default.createElement(Spinner_1.Spinner, { size: "24px", svgSize: "small" })));
            }
            else {
                throw new Error('SearchResults.renderRowContents: Encountered unknown row type');
            }
        }
        componentDidUpdate(prevProps) {
            const { items, searchTerm, discussionsLoading, messagesLoading, } = this.props;
            if (searchTerm !== prevProps.searchTerm) {
                this.resizeAll();
            }
            else if (discussionsLoading !== prevProps.discussionsLoading ||
                messagesLoading !== prevProps.messagesLoading) {
                this.resizeAll();
            }
            else if (items &&
                prevProps.items &&
                prevProps.items.length !== items.length) {
                this.resizeAll();
            }
        }
        getRowCount() {
            const { items } = this.props;
            return items ? items.length : 0;
        }
        render() {
            const { height, i18n, items, noResults, searchConversationName, searchTerm, width, } = this.props;
            const { scrollToIndex } = this.state;
            if (noResults) {
                return (react_1.default.createElement("div", { className: "module-search-results", tabIndex: -1, ref: this.containerRef, onFocus: this.handleFocus }, !searchConversationName || searchTerm ? (react_1.default.createElement("div", {
                    // We need this for Ctrl-T shortcut cycling through parts of app
                    tabIndex: -1, className: "module-search-results__no-results", key: searchTerm
                }, searchConversationName ? (react_1.default.createElement(Intl_1.Intl, {
                    id: "noSearchResultsInConversation", i18n: i18n, components: [
                        searchTerm,
                        react_1.default.createElement(Emojify_1.Emojify, { key: "item-1", text: searchConversationName }),
                    ]
                })) : (i18n('noSearchResults', [searchTerm])))) : null));
            }
            return (react_1.default.createElement("div", { className: "module-search-results", "aria-live": "polite", role: "group", tabIndex: -1, ref: this.containerRef, onKeyDown: this.handleKeyDown, onFocus: this.handleFocus },
                react_1.default.createElement(react_virtualized_1.List, { className: "module-search-results__virtual-list", deferredMeasurementCache: this.cellSizeCache, height: height, items: items, overscanRowCount: 5, ref: this.listRef, rowCount: this.getRowCount(), rowHeight: this.cellSizeCache.rowHeight, rowRenderer: this.renderRow, scrollToIndex: scrollToIndex, tabIndex: -1, onScroll: this.onScroll, width: width })));
        }
    }
    exports.SearchResults = SearchResults;
})();