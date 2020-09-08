(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery.DocumentListItem = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const moment_1 = __importDefault(window.moment);
    const filesize_1 = __importDefault(window.filesize);
    const styles = {
        container: {
            width: '100%',
            height: 72,
        },
        containerSeparator: {
            borderBottomWidth: 1,
            borderBottomColor: '#ccc',
            borderBottomStyle: 'solid',
        },
        itemContainer: {
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            height: '100%',
        },
        itemMetadata: {
            display: 'inline-flex',
            flexDirection: 'column',
            flexGrow: 1,
            flexShrink: 0,
            marginLeft: 8,
            marginRight: 8,
        },
        itemDate: {
            display: 'inline-block',
            flexShrink: 0,
        },
        itemIcon: {
            flexShrink: 0,
        },
        itemFileName: {
            fontWeight: 'bold',
        },
        itemFileSize: {
            display: 'inline-block',
            marginTop: 8,
            fontSize: '80%',
        },
    };
    class DocumentListItem extends react_1.default.Component {
        render() {
            const { shouldShowSeparator } = this.props;
            return (react_1.default.createElement("div", { style: Object.assign({}, styles.container, (shouldShowSeparator ? styles.containerSeparator : {})) }, this.renderContent()));
        }
        renderContent() {
            const { fileName, fileSize, timestamp } = this.props;
            return (react_1.default.createElement("div", { style: styles.itemContainer, onClick: this.props.onClick },
                react_1.default.createElement("img", { src: "images/file.svg", width: "48", height: "48", style: styles.itemIcon }),
                react_1.default.createElement("div", { style: styles.itemMetadata },
                    react_1.default.createElement("span", { style: styles.itemFileName }, fileName),
                    react_1.default.createElement("span", { style: styles.itemFileSize }, typeof fileSize === 'number' ? filesize_1.default(fileSize) : '')),
                react_1.default.createElement("div", { style: styles.itemDate }, moment_1.default(timestamp).format('ddd, MMM D, Y'))));
        }
    }
    DocumentListItem.defaultProps = {
        shouldShowSeparator: true,
    };
    exports.DocumentListItem = DocumentListItem;
})();