(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    const exports = window.ts.components.conversation.Timeline = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = window.lodash;
    const react_1 = __importDefault(window.react);
    const react_virtualized_1 = window.react_virtualized;
    const ScrollDownButton_1 = window.ts.components.conversation.ScrollDownButton;
    const AT_BOTTOM_THRESHOLD = 1;
    const NEAR_BOTTOM_THRESHOLD = 15;
    const AT_TOP_THRESHOLD = 10;
    const LOAD_MORE_THRESHOLD = 30;
    const SCROLL_DOWN_BUTTON_THRESHOLD = 8;
    exports.LOAD_COUNTDOWN = 2 * 1000;
    class Timeline extends react_1.default.PureComponent {
        constructor(props) {
            super(props);
            this.cellSizeCache = new react_virtualized_1.CellMeasurerCache({
                defaultHeight: 64,
                fixedWidth: true,
            });
            this.mostRecentWidth = 0;
            this.mostRecentHeight = 0;
            this.offsetFromBottom = 0;
            this.resizeAllFlag = false;
            this.listRef = react_1.default.createRef();
            this.getList = () => {
                if (!this.listRef) {
                    return;
                }
                const { current } = this.listRef;
                return current;
            };
            this.getGrid = () => {
                const list = this.getList();
                if (!list) {
                    return;
                }
                return list.Grid;
            };
            this.getScrollContainer = () => {
                const grid = this.getGrid();
                if (!grid) {
                    return;
                }
                return grid._scrollingContainer;
            };
            this.scrollToRow = (row) => {
                const list = this.getList();
                if (!list) {
                    return;
                }
                list.scrollToRow(row);
            };
            this.recomputeRowHeights = (row) => {
                const list = this.getList();
                if (!list) {
                    return;
                }
                list.recomputeRowHeights(row);
            };
            this.onHeightOnlyChange = () => {
                const grid = this.getGrid();
                const scrollContainer = this.getScrollContainer();
                if (!grid || !scrollContainer) {
                    return;
                }
                if (!lodash_1.isNumber(this.offsetFromBottom)) {
                    return;
                }
                const { clientHeight, scrollHeight, scrollTop } = scrollContainer;
                const newOffsetFromBottom = Math.max(0, scrollHeight - clientHeight - scrollTop);
                const delta = newOffsetFromBottom - this.offsetFromBottom;
                grid.scrollToPosition({ scrollTop: scrollContainer.scrollTop + delta });
            };
            this.resizeAll = () => {
                this.offsetFromBottom = undefined;
                this.resizeAllFlag = false;
                this.cellSizeCache.clearAll();
                const rowCount = this.getRowCount();
                this.recomputeRowHeights(rowCount - 1);
            };
            this.onScroll = (data) => {
                // Ignore scroll events generated as react-virtualized recursively scrolls and
                //   re-measures to get us where we want to go.
                if (lodash_1.isNumber(data.scrollToRow) &&
                    data.scrollToRow >= 0 &&
                    !data._hasScrolledToRowTarget) {
                    return;
                }
                // Sometimes react-virtualized ends up with some incorrect math - we've scrolled below
                //  what should be possible. In this case, we leave everything the same and ask
                //  react-virtualized to try again. Without this, we'll set atBottom to true and
                //  pop the user back down to the bottom.
                const { clientHeight, scrollHeight, scrollTop } = data;
                if (scrollTop + clientHeight > scrollHeight) {
                    this.resizeAll();
                    return;
                }
                this.updateScrollMetrics(data);
                this.updateWithVisibleRows();
            };
            // tslint:disable-next-line member-ordering
            this.updateScrollMetrics = lodash_1.debounce((data) => {
                const { clientHeight, clientWidth, scrollHeight, scrollTop } = data;
                if (clientHeight <= 0 || scrollHeight <= 0) {
                    return;
                }
                const { haveNewest, haveOldest, id, setIsNearBottom, setLoadCountdownStart, } = this.props;
                if (this.mostRecentHeight &&
                    clientHeight !== this.mostRecentHeight &&
                    this.mostRecentWidth &&
                    clientWidth === this.mostRecentWidth) {
                    this.onHeightOnlyChange();
                }
                // If we've scrolled, we want to reset these
                const oneTimeScrollRow = undefined;
                const propScrollToIndex = undefined;
                this.offsetFromBottom = Math.max(0, scrollHeight - clientHeight - scrollTop);
                const atBottom = haveNewest && this.offsetFromBottom <= AT_BOTTOM_THRESHOLD;
                const isNearBottom = haveNewest && this.offsetFromBottom <= NEAR_BOTTOM_THRESHOLD;
                const atTop = scrollTop <= AT_TOP_THRESHOLD;
                const loadCountdownStart = atTop && !haveOldest ? Date.now() : undefined;
                if (this.loadCountdownTimeout) {
                    clearTimeout(this.loadCountdownTimeout);
                    this.loadCountdownTimeout = null;
                }
                if (lodash_1.isNumber(loadCountdownStart)) {
                    this.loadCountdownTimeout = setTimeout(this.loadOlderMessages, exports.LOAD_COUNTDOWN);
                }
                if (loadCountdownStart !== this.props.loadCountdownStart) {
                    setLoadCountdownStart(id, loadCountdownStart);
                }
                setIsNearBottom(id, isNearBottom);
                this.setState({
                    atBottom,
                    atTop,
                    oneTimeScrollRow,
                    propScrollToIndex,
                });
            }, 50, { maxWait: 50 });
            this.updateVisibleRows = () => {
                let newest;
                let oldest;
                const scrollContainer = this.getScrollContainer();
                if (!scrollContainer) {
                    return;
                }
                if (scrollContainer.clientHeight === 0) {
                    return;
                }
                const visibleTop = scrollContainer.scrollTop;
                const visibleBottom = visibleTop + scrollContainer.clientHeight;
                const innerScrollContainer = scrollContainer.children[0];
                if (!innerScrollContainer) {
                    return;
                }
                const { children } = innerScrollContainer;
                for (let i = children.length - 1; i >= 0; i -= 1) {
                    const child = children[i];
                    const { id, offsetTop, offsetHeight } = child;
                    if (!id) {
                        continue;
                    }
                    const bottom = offsetTop + offsetHeight;
                    if (bottom - AT_BOTTOM_THRESHOLD <= visibleBottom) {
                        const row = parseInt(child.getAttribute('data-row') || '-1', 10);
                        newest = { offsetTop, row, id };
                        break;
                    }
                }
                const max = children.length;
                for (let i = 0; i < max; i += 1) {
                    const child = children[i];
                    const { offsetTop, id } = child;
                    if (!id) {
                        continue;
                    }
                    if (offsetTop + AT_TOP_THRESHOLD >= visibleTop) {
                        const row = parseInt(child.getAttribute('data-row') || '-1', 10);
                        oldest = { offsetTop, row, id };
                        break;
                    }
                }
                this.visibleRows = { newest, oldest };
            };
            // tslint:disable-next-line member-ordering cyclomatic-complexity
            this.updateWithVisibleRows = lodash_1.debounce((forceFocus) => {
                const { unreadCount, haveNewest, isLoadingMessages, items, loadNewerMessages, markMessageRead, } = this.props;
                if (!items || items.length < 1) {
                    return;
                }
                this.updateVisibleRows();
                if (!this.visibleRows) {
                    return;
                }
                const { newest } = this.visibleRows;
                if (!newest || !newest.id) {
                    return;
                }
                markMessageRead(newest.id, forceFocus);
                const rowCount = this.getRowCount();
                const lastId = items[items.length - 1];
                if (!isLoadingMessages &&
                    !haveNewest &&
                    newest.row > rowCount - LOAD_MORE_THRESHOLD) {
                    loadNewerMessages(lastId);
                }
                const lastIndex = items.length - 1;
                const lastItemRow = this.fromItemIndexToRow(lastIndex);
                const areUnreadBelowCurrentPosition = Boolean(lodash_1.isNumber(unreadCount) &&
                    unreadCount > 0 &&
                    (!haveNewest || newest.row < lastItemRow));
                const shouldShowScrollDownButton = Boolean(!haveNewest ||
                    areUnreadBelowCurrentPosition ||
                    newest.row < rowCount - SCROLL_DOWN_BUTTON_THRESHOLD);
                this.setState({
                    shouldShowScrollDownButton,
                    areUnreadBelowCurrentPosition,
                });
            }, 500, { maxWait: 500 });
            this.loadOlderMessages = () => {
                const { haveOldest, isLoadingMessages, items, loadOlderMessages, } = this.props;
                if (this.loadCountdownTimeout) {
                    clearTimeout(this.loadCountdownTimeout);
                    this.loadCountdownTimeout = null;
                }
                if (isLoadingMessages || haveOldest || !items || items.length < 1) {
                    return;
                }
                const oldestId = items[0];
                loadOlderMessages(oldestId);
            };
            this.rowRenderer = ({ index, key, parent, style, }) => {
                const { id, haveOldest, items, renderItem, renderLoadingRow, renderLastSeenIndicator, renderTypingBubble, } = this.props;
                const styleWithWidth = Object.assign({}, style, { width: `${this.mostRecentWidth}px` });
                const row = index;
                const oldestUnreadRow = this.getLastSeenIndicatorRow();
                const typingBubbleRow = this.getTypingBubbleRow();
                let rowContents;
                if (!haveOldest && row === 0) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, style: styleWithWidth }, renderLoadingRow(id)));
                }
                else if (oldestUnreadRow === row) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, style: styleWithWidth }, renderLastSeenIndicator(id)));
                }
                else if (typingBubbleRow === row) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, className: "module-timeline__message-container", style: styleWithWidth }, renderTypingBubble(id)));
                }
                else {
                    const itemIndex = this.fromRowToItemIndex(row);
                    if (typeof itemIndex !== 'number') {
                        throw new Error(`Attempted to render item with undefined index - row ${row}`);
                    }
                    const messageId = items[itemIndex];
                    rowContents = (react_1.default.createElement("div", { id: messageId, "data-row": row, className: "module-timeline__message-container", style: styleWithWidth }, renderItem(messageId, this.props)));
                }
                return (react_1.default.createElement(react_virtualized_1.CellMeasurer, { cache: this.cellSizeCache, columnIndex: 0, key: key, parent: parent, rowIndex: index, width: this.mostRecentWidth }, rowContents));
            };
            this.onScrollToMessage = (messageId) => {
                const { isLoadingMessages, items, loadAndScroll } = this.props;
                const index = items.findIndex(item => item === messageId);
                if (index >= 0) {
                    const row = this.fromItemIndexToRow(index);
                    this.setState({
                        oneTimeScrollRow: row,
                    });
                }
                if (!isLoadingMessages) {
                    loadAndScroll(messageId);
                }
            };
            this.scrollToBottom = () => {
                this.setState({
                    propScrollToIndex: undefined,
                    oneTimeScrollRow: undefined,
                    atBottom: true,
                });
            };
            this.onClickScrollDownButton = () => {
                const { haveNewest, isLoadingMessages, items, loadNewestMessages, } = this.props;
                const lastId = items[items.length - 1];
                const lastSeenIndicatorRow = this.getLastSeenIndicatorRow();
                if (!this.visibleRows) {
                    if (haveNewest) {
                        this.scrollToBottom();
                    }
                    else if (!isLoadingMessages) {
                        loadNewestMessages(lastId);
                    }
                    return;
                }
                const { newest } = this.visibleRows;
                if (newest &&
                    lodash_1.isNumber(lastSeenIndicatorRow) &&
                    newest.row < lastSeenIndicatorRow) {
                    this.setState({
                        oneTimeScrollRow: lastSeenIndicatorRow,
                    });
                }
                else if (haveNewest) {
                    this.scrollToBottom();
                }
                else if (!isLoadingMessages) {
                    loadNewestMessages(lastId);
                }
            };
            this.forceFocusVisibleRowUpdate = () => {
                const forceFocus = true;
                this.updateWithVisibleRows(forceFocus);
            };
            this.getScrollTarget = () => {
                const { oneTimeScrollRow, atBottom, propScrollToIndex } = this.state;
                const rowCount = this.getRowCount();
                const targetMessage = lodash_1.isNumber(propScrollToIndex)
                    ? this.fromItemIndexToRow(propScrollToIndex)
                    : undefined;
                const scrollToBottom = atBottom ? rowCount - 1 : undefined;
                if (lodash_1.isNumber(targetMessage)) {
                    return targetMessage;
                }
                if (lodash_1.isNumber(oneTimeScrollRow)) {
                    return oneTimeScrollRow;
                }
                return scrollToBottom;
            };
            const { scrollToIndex } = this.props;
            const oneTimeScrollRow = this.getLastSeenIndicatorRow();
            this.state = {
                atBottom: true,
                atTop: false,
                oneTimeScrollRow,
                propScrollToIndex: scrollToIndex,
                prevPropScrollToIndex: scrollToIndex,
                shouldShowScrollDownButton: false,
                areUnreadBelowCurrentPosition: false,
            };
        }
        static getDerivedStateFromProps(props, state) {
            if (lodash_1.isNumber(props.scrollToIndex) &&
                (props.scrollToIndex !== state.prevPropScrollToIndex ||
                    props.scrollToIndexCounter !== state.prevPropScrollToIndexCounter)) {
                return Object.assign({}, state, { propScrollToIndex: props.scrollToIndex, prevPropScrollToIndex: props.scrollToIndex, prevPropScrollToIndexCounter: props.scrollToIndexCounter });
            }
            return state;
        }
        fromItemIndexToRow(index) {
            const { haveOldest, oldestUnreadIndex } = this.props;
            let addition = 0;
            if (!haveOldest) {
                addition += 1;
            }
            if (lodash_1.isNumber(oldestUnreadIndex) && index >= oldestUnreadIndex) {
                addition += 1;
            }
            return index + addition;
        }
        getRowCount() {
            const { haveOldest, oldestUnreadIndex, typingContact } = this.props;
            const { items } = this.props;
            const itemsCount = items && items.length ? items.length : 0;
            let extraRows = 0;
            if (!haveOldest) {
                extraRows += 1;
            }
            if (lodash_1.isNumber(oldestUnreadIndex)) {
                extraRows += 1;
            }
            if (typingContact) {
                extraRows += 1;
            }
            return itemsCount + extraRows;
        }
        fromRowToItemIndex(row) {
            const { haveOldest, items } = this.props;
            let subtraction = 0;
            if (!haveOldest) {
                subtraction += 1;
            }
            const oldestUnreadRow = this.getLastSeenIndicatorRow();
            if (lodash_1.isNumber(oldestUnreadRow) && row > oldestUnreadRow) {
                subtraction += 1;
            }
            const index = row - subtraction;
            if (index < 0 || index >= items.length) {
                return;
            }
            return index;
        }
        getLastSeenIndicatorRow() {
            const { oldestUnreadIndex } = this.props;
            if (!lodash_1.isNumber(oldestUnreadIndex)) {
                return;
            }
            return this.fromItemIndexToRow(oldestUnreadIndex) - 1;
        }
        getTypingBubbleRow() {
            const { items } = this.props;
            if (!items || items.length < 0) {
                return;
            }
            const last = items.length - 1;
            return this.fromItemIndexToRow(last) + 1;
        }
        componentDidMount() {
            this.updateWithVisibleRows();
            // @ts-ignore
            window.registerForFocus(this.forceFocusVisibleRowUpdate);
        }
        componentWillUnmount() {
            // @ts-ignore
            window.unregisterForFocus(this.forceFocusVisibleRowUpdate);
        }
        // tslint:disable-next-line cyclomatic-complexity
        componentDidUpdate(prevProps) {
            const { id, clearChangedMessages, items, messageHeightChanges, oldestUnreadIndex, resetCounter, scrollToIndex, typingContact, } = this.props;
            // There are a number of situations which can necessitate that we drop our row height
            //   cache and start over. It can cause the scroll position to do weird things, so we
            //   try to minimize those situations. In some cases we could reset a smaller set
            //   of cached row data, but we currently don't have an API for that. We'd need to
            //   create it.
            if (!prevProps.items ||
                prevProps.items.length === 0 ||
                resetCounter !== prevProps.resetCounter) {
                const oneTimeScrollRow = this.getLastSeenIndicatorRow();
                this.setState({
                    oneTimeScrollRow,
                    atBottom: true,
                    propScrollToIndex: scrollToIndex,
                    prevPropScrollToIndex: scrollToIndex,
                });
                if (prevProps.items && prevProps.items.length > 0) {
                    this.resizeAll();
                }
            }
            else if (!typingContact && prevProps.typingContact) {
                this.resizeAll();
            }
            else if (oldestUnreadIndex !== prevProps.oldestUnreadIndex) {
                this.resizeAll();
            }
            else if (items &&
                items.length > 0 &&
                prevProps.items &&
                prevProps.items.length > 0 &&
                items !== prevProps.items) {
                if (this.state.atTop) {
                    const oldFirstIndex = 0;
                    const oldFirstId = prevProps.items[oldFirstIndex];
                    const newFirstIndex = items.findIndex(item => item === oldFirstId);
                    if (newFirstIndex < 0) {
                        this.resizeAll();
                        return;
                    }
                    const newRow = this.fromItemIndexToRow(newFirstIndex);
                    const delta = newFirstIndex - oldFirstIndex;
                    if (delta > 0) {
                        // We're loading more new messages at the top; we want to stay at the top
                        this.resizeAll();
                        this.setState({ oneTimeScrollRow: newRow });
                        return;
                    }
                }
                // We continue on after our atTop check; because if we're not loading new messages
                //   we still have to check for all the other situations which might require a
                //   resize.
                const oldLastIndex = prevProps.items.length - 1;
                const oldLastId = prevProps.items[oldLastIndex];
                const newLastIndex = items.findIndex(item => item === oldLastId);
                if (newLastIndex < 0) {
                    this.resizeAll();
                    return;
                }
                const indexDelta = newLastIndex - oldLastIndex;
                // If we've just added to the end of the list, then the index of the last id's
                //   index won't have changed, and we can rely on List's detection that items is
                //   different for the necessary re-render.
                if (indexDelta !== 0) {
                    this.resizeAll();
                }
                else if (typingContact && prevProps.typingContact) {
                    // The last row will be off, because it was previously the typing indicator
                    this.resizeAll();
                }
            }
            else if (messageHeightChanges) {
                this.resizeAll();
                clearChangedMessages(id);
            }
            else if (this.resizeAllFlag) {
                this.resizeAll();
            }
            else {
                this.updateWithVisibleRows();
            }
        }
        render() {
            const { i18n, id, items } = this.props;
            const { shouldShowScrollDownButton, areUnreadBelowCurrentPosition, } = this.state;
            const rowCount = this.getRowCount();
            const scrollToIndex = this.getScrollTarget();
            if (!items || rowCount === 0) {
                return null;
            }
            return (react_1.default.createElement("div", { className: "module-timeline" },
                react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => {
                    if (this.mostRecentWidth && this.mostRecentWidth !== width) {
                        this.resizeAllFlag = true;
                        setTimeout(this.resizeAll, 0);
                    }
                    else if (this.mostRecentHeight &&
                        this.mostRecentHeight !== height) {
                        setTimeout(this.onHeightOnlyChange, 0);
                    }
                    this.mostRecentWidth = width;
                    this.mostRecentHeight = height;
                    return (react_1.default.createElement(react_virtualized_1.List, { deferredMeasurementCache: this.cellSizeCache, height: height, onScroll: this.onScroll, overscanRowCount: 10, ref: this.listRef, rowCount: rowCount, rowHeight: this.cellSizeCache.rowHeight, rowRenderer: this.rowRenderer, scrollToAlignment: "start", scrollToIndex: scrollToIndex, width: width }));
                }),
                shouldShowScrollDownButton ? (react_1.default.createElement(ScrollDownButton_1.ScrollDownButton, { conversationId: id, withNewMessages: areUnreadBelowCurrentPosition, scrollDown: this.onClickScrollDownButton, i18n: i18n })) : null));
        }
    }
    exports.Timeline = Timeline;
})();