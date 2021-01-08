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
    const ConversationListItem_1 = window.ts.components.ConversationListItem;
    const StartNewConversation_1 = window.ts.components.StartNewConversation;
    class SearchResults extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.mostRecentWidth = 0;
            this.mostRecentHeight = 0;
            this.cellSizeCache = new react_virtualized_1.CellMeasurerCache({
                defaultHeight: 36,
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
                return (react_1.default.createElement("div", { key: key, style: style },
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
                const rowCount = this.getRowCount();
                this.recomputeRowHeights(rowCount - 1);
            };
        }
        renderRowContents(row) {
            const { searchTerm, i18n, openConversationInternal, renderMessageSearchResult, } = this.props;
            if (row.type === 'start-new-conversation') {
                return (react_1.default.createElement(StartNewConversation_1.StartNewConversation, { phoneNumber: searchTerm, i18n: i18n, onClick: this.handleStartNewConversation }));
            }
            else if (row.type === 'conversations-header') {
                return (react_1.default.createElement("div", { className: "module-search-results__conversations-header" }, i18n('conversationsHeader')));
            }
            else if (row.type === 'conversation') {
                const { data } = row;
                return (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: data.phoneNumber }, data, { onClick: openConversationInternal, i18n: i18n })));
            }
            else if (row.type === 'contacts-header') {
                return (react_1.default.createElement("div", { className: "module-search-results__contacts-header" }, i18n('contactsHeader')));
            }
            else if (row.type === 'contact') {
                const { data } = row;
                return (react_1.default.createElement(ConversationListItem_1.ConversationListItem, Object.assign({ key: data.phoneNumber }, data, { onClick: openConversationInternal, i18n: i18n })));
            }
            else if (row.type === 'messages-header') {
                return (react_1.default.createElement("div", { className: "module-search-results__messages-header" }, i18n('messagesHeader')));
            }
            else if (row.type === 'message') {
                const { data } = row;
                return renderMessageSearchResult(data);
            }
            else {
                throw new Error('SearchResults.renderRowContents: Encountered unknown row type');
            }
        }
        componentDidUpdate(prevProps) {
            const { items } = this.props;
            if (items &&
                items.length > 0 &&
                prevProps.items &&
                prevProps.items.length > 0 &&
                items !== prevProps.items) {
                this.resizeAll();
            }
        }
        getRowCount() {
            const { items } = this.props;
            return items ? items.length : 0;
        }
        render() {
            const { items, i18n, noResults, searchTerm } = this.props;
            if (noResults) {
                return (react_1.default.createElement("div", { className: "module-search-results" },
                    react_1.default.createElement("div", { className: "module-search-results__no-results" }, i18n('noSearchResults', [searchTerm]))));
            }
            return (react_1.default.createElement("div", { className: "module-search-results", key: searchTerm },
                react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => {
                    this.mostRecentWidth = width;
                    this.mostRecentHeight = height;
                    return (react_1.default.createElement(react_virtualized_1.List, { className: "module-search-results__virtual-list", deferredMeasurementCache: this.cellSizeCache, height: height, items: items, overscanRowCount: 5, ref: this.listRef, rowCount: this.getRowCount(), rowHeight: this.cellSizeCache.rowHeight, rowRenderer: this.renderRow, width: width }));
                })));
        }
    }
    exports.SearchResults = SearchResults;
})();