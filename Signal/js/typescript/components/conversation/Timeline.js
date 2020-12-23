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
const react_1 = __importDefault(window.react);
const react_virtualized_1 = window.react_virtualized;
class Timeline extends react_1.default.PureComponent {
    constructor() {
        super(...arguments);
        this.cellSizeCache = new react_virtualized_1.CellMeasurerCache({
            defaultHeight: 85,
            fixedWidth: true,
        });
        this.mostRecentWidth = 0;
        this.resizeAllFlag = false;
        this.listRef = react_1.default.createRef();
        this.resizeAll = () => {
            this.resizeAllFlag = false;
            this.cellSizeCache.clearAll();
        };
        this.recomputeRowHeights = (index) => {
            if (this.listRef && this.listRef) {
                this.listRef.current.recomputeRowHeights(index);
            }
        };
        this.rowRenderer = ({ index, key, parent, style, }) => {
            const { items, renderItem } = this.props;
            const messageId = items[index];
            return (react_1.default.createElement(react_virtualized_1.CellMeasurer, { cache: this.cellSizeCache, columnIndex: 0, key: key, parent: parent, rowIndex: index, width: this.mostRecentWidth },
                react_1.default.createElement("div", { className: "module-timeline__message-container", style: style }, renderItem(messageId))));
        };
    }
    componentDidUpdate(prevProps) {
        if (this.resizeAllFlag) {
            this.resizeAllFlag = false;
            this.cellSizeCache.clearAll();
            this.recomputeRowHeights();
        }
        else if (this.props.items !== prevProps.items) {
            const index = prevProps.items.length;
            this.cellSizeCache.clear(index, 0);
            this.recomputeRowHeights(index);
        }
    }
    render() {
        const { items } = this.props;
        return (react_1.default.createElement("div", { className: "module-timeline" },
            react_1.default.createElement(react_virtualized_1.AutoSizer, null, ({ height, width }) => {
                if (this.mostRecentWidth && this.mostRecentWidth !== width) {
                    this.resizeAllFlag = true;
                    setTimeout(this.resizeAll, 0);
                }
                this.mostRecentWidth = width;
                return (react_1.default.createElement(react_virtualized_1.List, { deferredMeasurementCache: this.cellSizeCache, height: height, 
                    // This also registers us with parent InfiniteLoader
                    // onRowsRendered={onRowsRendered}
                    overscanRowCount: 0, ref: this.listRef, rowCount: items.length, rowHeight: this.cellSizeCache.rowHeight, rowRenderer: this.rowRenderer, width: width }));
            })));
    }
}
exports.Timeline = Timeline;
})();