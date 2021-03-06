require(exports => {
    "use strict";
    // Copyright 2019-2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    const classnames_1 = __importDefault(require("classnames"));
    const react_1 = __importDefault(require("react"));
    const react_virtualized_1 = require("react-virtualized");
    const ScrollDownButton_1 = require("./ScrollDownButton");
    const AT_BOTTOM_THRESHOLD = 15;
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
            this.resizeFlag = false;
            this.listRef = react_1.default.createRef();
            this.loadCountdownTimeout = null;
            this.getList = () => {
                if (!this.listRef) {
                    return null;
                }
                const { current } = this.listRef;
                return current;
            };
            this.getGrid = () => {
                const list = this.getList();
                if (!list) {
                    return;
                }
                // eslint-disable-next-line consistent-return
                return list.Grid;
            };
            this.getScrollContainer = () => {
                // We're using an internal variable (_scrollingContainer)) here,
                // so cannot rely on the public type.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const grid = this.getGrid();
                if (!grid) {
                    return;
                }
                // eslint-disable-next-line consistent-return
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
                // TODO: DESKTOP-687
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                grid.scrollToPosition({
                    scrollTop: scrollContainer.scrollTop + delta,
                });
            };
            this.resize = (row) => {
                this.offsetFromBottom = undefined;
                this.resizeFlag = false;
                if (lodash_1.isNumber(row) && row > 0) {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    this.cellSizeCache.clearPlus(row, 0);
                }
                else {
                    this.cellSizeCache.clearAll();
                }
                this.recomputeRowHeights(row || 0);
            };
            this.resizeHeroRow = () => {
                this.resize(0);
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
                    return;
                }
                this.updateScrollMetrics(data);
                this.updateWithVisibleRows();
            };
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
                // Variable collision
                // eslint-disable-next-line react/destructuring-assignment
                if (loadCountdownStart !== this.props.loadCountdownStart) {
                    setLoadCountdownStart(id, loadCountdownStart);
                }
                // Variable collision
                // eslint-disable-next-line react/destructuring-assignment
                if (isNearBottom !== this.props.isNearBottom) {
                    setIsNearBottom(id, isNearBottom);
                }
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
            this.updateWithVisibleRows = lodash_1.debounce(() => {
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
                markMessageRead(newest.id);
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
                const { id, haveOldest, items, renderItem, renderHeroRow, renderLoadingRow, renderLastSeenIndicator, renderTypingBubble, updateSharedGroups, } = this.props;
                const styleWithWidth = Object.assign(Object.assign({}, style), { width: `${this.mostRecentWidth}px` });
                const row = index;
                const oldestUnreadRow = this.getLastSeenIndicatorRow();
                const typingBubbleRow = this.getTypingBubbleRow();
                let rowContents;
                if (haveOldest && row === 0) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, style: styleWithWidth, role: "row" }, renderHeroRow(id, this.resizeHeroRow, updateSharedGroups)));
                }
                else if (!haveOldest && row === 0) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, style: styleWithWidth, role: "row" }, renderLoadingRow(id)));
                }
                else if (oldestUnreadRow === row) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, style: styleWithWidth, role: "row" }, renderLastSeenIndicator(id)));
                }
                else if (typingBubbleRow === row) {
                    rowContents = (react_1.default.createElement("div", { "data-row": row, className: "module-timeline__message-container", style: styleWithWidth, role: "row" }, renderTypingBubble(id)));
                }
                else {
                    const itemIndex = this.fromRowToItemIndex(row);
                    if (typeof itemIndex !== 'number') {
                        throw new Error(`Attempted to render item with undefined index - row ${row}`);
                    }
                    const messageId = items[itemIndex];
                    rowContents = (react_1.default.createElement("div", { id: messageId, "data-row": row, className: "module-timeline__message-container", style: styleWithWidth, role: "row" }, renderItem(messageId, id, this.props)));
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
            this.scrollToBottom = (setFocus) => {
                const { selectMessage, id, items } = this.props;
                if (setFocus && items && items.length > 0) {
                    const lastIndex = items.length - 1;
                    const lastMessageId = items[lastIndex];
                    selectMessage(lastMessageId, id);
                }
                this.setState({
                    propScrollToIndex: undefined,
                    oneTimeScrollRow: undefined,
                    atBottom: true,
                });
            };
            this.onClickScrollDownButton = () => {
                this.scrollDown(false);
            };
            this.scrollDown = (setFocus) => {
                const { haveNewest, id, isLoadingMessages, items, loadNewestMessages, oldestUnreadIndex, selectMessage, } = this.props;
                if (!items || items.length < 1) {
                    return;
                }
                const lastId = items[items.length - 1];
                const lastSeenIndicatorRow = this.getLastSeenIndicatorRow();
                if (!this.visibleRows) {
                    if (haveNewest) {
                        this.scrollToBottom(setFocus);
                    }
                    else if (!isLoadingMessages) {
                        loadNewestMessages(lastId, setFocus);
                    }
                    return;
                }
                const { newest } = this.visibleRows;
                if (newest &&
                    lodash_1.isNumber(lastSeenIndicatorRow) &&
                    newest.row < lastSeenIndicatorRow) {
                    if (setFocus && lodash_1.isNumber(oldestUnreadIndex)) {
                        const messageId = items[oldestUnreadIndex];
                        selectMessage(messageId, id);
                    }
                    this.setState({
                        oneTimeScrollRow: lastSeenIndicatorRow,
                    });
                }
                else if (haveNewest) {
                    this.scrollToBottom(setFocus);
                }
                else if (!isLoadingMessages) {
                    loadNewestMessages(lastId, setFocus);
                }
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
            this.handleBlur = (event) => {
                const { clearSelectedMessage } = this.props;
                const { currentTarget } = event;
                // Thanks to https://gist.github.com/pstoica/4323d3e6e37e8a23dd59
                setTimeout(() => {
                    // If focus moved to one of our portals, we do not clear the selected
                    // message so that focus stays inside the portal. We need to be careful
                    // to not create colliding keyboard shortcuts between selected messages
                    // and our portals!
                    const portals = Array.from(document.querySelectorAll('body > div:not(.inbox)'));
                    if (portals.some(el => el.contains(document.activeElement))) {
                        return;
                    }
                    if (!currentTarget.contains(document.activeElement)) {
                        clearSelectedMessage();
                    }
                }, 0);
            };
            this.handleKeyDown = (event) => {
                const { selectMessage, selectedMessageId, items, id } = this.props;
                const commandKey = lodash_1.get(window, 'platform') === 'darwin' && event.metaKey;
                const controlKey = lodash_1.get(window, 'platform') !== 'darwin' && event.ctrlKey;
                const commandOrCtrl = commandKey || controlKey;
                if (!items || items.length < 1) {
                    return;
                }
                if (selectedMessageId && !commandOrCtrl && event.key === 'ArrowUp') {
                    const selectedMessageIndex = items.findIndex(item => item === selectedMessageId);
                    if (selectedMessageIndex < 0) {
                        return;
                    }
                    const targetIndex = selectedMessageIndex - 1;
                    if (targetIndex < 0) {
                        return;
                    }
                    const messageId = items[targetIndex];
                    selectMessage(messageId, id);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (selectedMessageId && !commandOrCtrl && event.key === 'ArrowDown') {
                    const selectedMessageIndex = items.findIndex(item => item === selectedMessageId);
                    if (selectedMessageIndex < 0) {
                        return;
                    }
                    const targetIndex = selectedMessageIndex + 1;
                    if (targetIndex >= items.length) {
                        return;
                    }
                    const messageId = items[targetIndex];
                    selectMessage(messageId, id);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (commandOrCtrl && event.key === 'ArrowUp') {
                    this.setState({ oneTimeScrollRow: 0 });
                    const firstMessageId = items[0];
                    selectMessage(firstMessageId, id);
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
                if (commandOrCtrl && event.key === 'ArrowDown') {
                    this.scrollDown(true);
                    event.preventDefault();
                    event.stopPropagation();
                }
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
                return Object.assign(Object.assign({}, state), { propScrollToIndex: props.scrollToIndex, prevPropScrollToIndex: props.scrollToIndex, prevPropScrollToIndexCounter: props.scrollToIndexCounter });
            }
            return state;
        }
        fromItemIndexToRow(index) {
            const { oldestUnreadIndex } = this.props;
            // We will always render either the hero row or the loading row
            let addition = 1;
            if (lodash_1.isNumber(oldestUnreadIndex) && index >= oldestUnreadIndex) {
                addition += 1;
            }
            return index + addition;
        }
        getRowCount() {
            const { oldestUnreadIndex, typingContact } = this.props;
            const { items } = this.props;
            const itemsCount = items && items.length ? items.length : 0;
            // We will always render either the hero row or the loading row
            let extraRows = 1;
            if (lodash_1.isNumber(oldestUnreadIndex)) {
                extraRows += 1;
            }
            if (typingContact) {
                extraRows += 1;
            }
            return itemsCount + extraRows;
        }
        fromRowToItemIndex(row, props) {
            const { items } = props || this.props;
            // We will always render either the hero row or the loading row
            let subtraction = 1;
            const oldestUnreadRow = this.getLastSeenIndicatorRow();
            if (lodash_1.isNumber(oldestUnreadRow) && row > oldestUnreadRow) {
                subtraction += 1;
            }
            const index = row - subtraction;
            if (index < 0 || index >= items.length) {
                return;
            }
            // eslint-disable-next-line consistent-return
            return index;
        }
        getLastSeenIndicatorRow(props) {
            const { oldestUnreadIndex } = props || this.props;
            if (!lodash_1.isNumber(oldestUnreadIndex)) {
                return;
            }
            // eslint-disable-next-line consistent-return
            return this.fromItemIndexToRow(oldestUnreadIndex) - 1;
        }
        getTypingBubbleRow() {
            const { items } = this.props;
            if (!items || items.length < 0) {
                return;
            }
            const last = items.length - 1;
            // eslint-disable-next-line consistent-return
            return this.fromItemIndexToRow(last) + 1;
        }
        componentDidMount() {
            this.updateWithVisibleRows();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.registerForActive(this.updateWithVisibleRows);
        }
        componentWillUnmount() {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.unregisterForActive(this.updateWithVisibleRows);
        }
        componentDidUpdate(prevProps) {
            const { id, clearChangedMessages, items, messageHeightChangeIndex, oldestUnreadIndex, resetCounter, scrollToIndex, typingContact, } = this.props;
            // There are a number of situations which can necessitate that we forget about row
            //   heights previously calculated. We reset the minimum number of rows to minimize
            //   unexpected changes to the scroll position. Those changes happen because
            //   react-virtualized doesn't know what to expect (variable row heights) when it
            //   renders, so it does have a fixed row it's attempting to scroll to, and you ask it
            //   to render a given point it space, it will do pretty random things.
            if (!prevProps.items ||
                prevProps.items.length === 0 ||
                resetCounter !== prevProps.resetCounter) {
                if (prevProps.items && prevProps.items.length > 0) {
                    this.resize();
                }
                const oneTimeScrollRow = this.getLastSeenIndicatorRow();
                // TODO: DESKTOP-688
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    oneTimeScrollRow,
                    atBottom: true,
                    propScrollToIndex: scrollToIndex,
                    prevPropScrollToIndex: scrollToIndex,
                });
                return;
            }
            if (items &&
                items.length > 0 &&
                prevProps.items &&
                prevProps.items.length > 0 &&
                items !== prevProps.items) {
                const { atTop } = this.state;
                if (atTop) {
                    const oldFirstIndex = 0;
                    const oldFirstId = prevProps.items[oldFirstIndex];
                    const newFirstIndex = items.findIndex(item => item === oldFirstId);
                    if (newFirstIndex < 0) {
                        this.resize();
                        return;
                    }
                    const newRow = this.fromItemIndexToRow(newFirstIndex);
                    const delta = newFirstIndex - oldFirstIndex;
                    if (delta > 0) {
                        // We're loading more new messages at the top; we want to stay at the top
                        this.resize();
                        // TODO: DESKTOP-688
                        // eslint-disable-next-line react/no-did-update-set-state
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
                    this.resize();
                    return;
                }
                const indexDelta = newLastIndex - oldLastIndex;
                // If we've just added to the end of the list, then the index of the last id's
                //   index won't have changed, and we can rely on List's detection that items is
                //   different for the necessary re-render.
                if (indexDelta === 0) {
                    if (typingContact || prevProps.typingContact) {
                        // The last row will be off, because it was previously the typing indicator
                        const rowCount = this.getRowCount();
                        this.resize(rowCount - 2);
                    }
                    // no resize because we just add to the end
                    return;
                }
                this.resize();
                return;
            }
            if (this.resizeFlag) {
                this.resize();
                return;
            }
            if (oldestUnreadIndex !== prevProps.oldestUnreadIndex) {
                const prevRow = this.getLastSeenIndicatorRow(prevProps);
                const newRow = this.getLastSeenIndicatorRow();
                const rowCount = this.getRowCount();
                const lastRow = rowCount - 1;
                const targetRow = Math.min(lodash_1.isNumber(prevRow) ? prevRow : lastRow, lodash_1.isNumber(newRow) ? newRow : lastRow);
                this.resize(targetRow);
                return;
            }
            if (lodash_1.isNumber(messageHeightChangeIndex)) {
                const rowIndex = this.fromItemIndexToRow(messageHeightChangeIndex);
                this.resize(rowIndex);
                clearChangedMessages(id);
                return;
            }
            if (Boolean(typingContact) !== Boolean(prevProps.typingContact)) {
                const rowCount = this.getRowCount();
                this.resize(rowCount - 2);
                return;
            }
            this.updateWithVisibleRows();
        }
        render() {
            const { i18n, id, items, isGroupV1AndDisabled } = this.props;
            const { shouldShowScrollDownButton, areUnreadBelowCurrentPosition, } = this.state;
            const rowCount = this.getRowCount();
            const scrollToIndex = this.getScrollTarget();
            if (!items || rowCount === 0) {
                return null;
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-timeline', isGroupV1AndDisabled ? 'module-timeline--disabled' : null), role: "presentation", tabIndex: -1, onBlur: this.handleBlur, onKeyDown: this.handleKeyDown },
                react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => {
                    if (this.mostRecentWidth && this.mostRecentWidth !== width) {
                        this.resizeFlag = true;
                        setTimeout(this.resize, 0);
                    }
                    else if (this.mostRecentHeight &&
                        this.mostRecentHeight !== height) {
                        setTimeout(this.onHeightOnlyChange, 0);
                    }
                    this.mostRecentWidth = width;
                    this.mostRecentHeight = height;
                    return (react_1.default.createElement(react_virtualized_1.List, {
                        deferredMeasurementCache: this.cellSizeCache, height: height,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onScroll: this.onScroll, overscanRowCount: 10, ref: this.listRef, rowCount: rowCount, rowHeight: this.cellSizeCache.rowHeight, rowRenderer: this.rowRenderer, scrollToAlignment: "start", scrollToIndex: scrollToIndex, tabIndex: -1, width: width
                    }));
                }),
                shouldShowScrollDownButton ? (react_1.default.createElement(ScrollDownButton_1.ScrollDownButton, { conversationId: id, withNewMessages: areUnreadBelowCurrentPosition, scrollDown: this.onClickScrollDownButton, i18n: i18n })) : null));
        }
    }
    exports.Timeline = Timeline;
});