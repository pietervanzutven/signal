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
    const Intl_1 = window.ts.components.Intl;
    const Emojify_1 = window.ts.components.conversation.Emojify;
    const Spinner_1 = window.ts.components.Spinner;
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const StartNewConversation_1 = window.ts.components.StartNewConversation;
    class SearchResults extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.mostRecentWidth = 0;
            this.mostRecentHeight = 0;
            this.cellSizeCache = new react_virtualized_1.CellMeasurerCache({
                defaultHeight: 80,
                fixedWidth: true,
            });
            this.listRef = react_1.default.createRef();
            this.handleStartNewConversation = () => {
                const { regionCode, searchTerm, startNewConversation } = this.props;
                startNewConversation(searchTerm, { regionCode });
            };
            this.renderRow = ({ index, key, parent, style, }) => {
                const { items } = this.props;
                const row = items[index];
                return (react_1.default.createElement("div", { role: "row", key: key, style: style },
                    react_1.default.createElement(react_virtualized_1.CellMeasurer, { cache: this.cellSizeCache, columnIndex: 0, key: key, parent: parent, rowIndex: index, width: this.mostRecentWidth }, this.renderRowContents(row))));
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
            const { i18n, items, noResults, searchConversationName, searchTerm, } = this.props;
            if (noResults) {
                return (react_1.default.createElement("div", { className: "module-search-results" }, !searchConversationName || searchTerm ? (react_1.default.createElement("div", { className: "module-search-results__no-results", key: searchTerm }, searchConversationName ? (react_1.default.createElement(Intl_1.Intl, {
                    id: "noSearchResultsInConversation", i18n: i18n, components: [
                        searchTerm,
                        react_1.default.createElement(Emojify_1.Emojify, { key: "item-1", text: searchConversationName }),
                    ]
                })) : (i18n('noSearchResults', [searchTerm])))) : null));
            }
            return (react_1.default.createElement("div", { className: "module-search-results" },
                react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => {
                    this.mostRecentWidth = width;
                    this.mostRecentHeight = height;
                    return (react_1.default.createElement(react_virtualized_1.List, { className: "module-search-results__virtual-list", deferredMeasurementCache: this.cellSizeCache, height: height, items: items, overscanRowCount: 5, ref: this.listRef, rowCount: this.getRowCount(), rowHeight: this.cellSizeCache.rowHeight, rowRenderer: this.renderRow, width: width }));
                })));
        }
    }
    exports.SearchResults = SearchResults;
})();