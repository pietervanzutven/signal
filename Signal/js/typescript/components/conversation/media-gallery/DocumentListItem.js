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
    const classnames_1 = __importDefault(window.classnames);
    const moment_1 = __importDefault(window.moment);
    // tslint:disable-next-line:match-default-export-name
    const filesize_1 = __importDefault(window.filesize);
    class DocumentListItem extends react_1.default.Component {
        render() {
            const { shouldShowSeparator } = this.props;
            return (react_1.default.createElement("div", {
                className: classnames_1.default('module-document-list-item', shouldShowSeparator
                    ? 'module-document-list-item--with-separator'
                    : null)
            }, this.renderContent()));
        }
        renderContent() {
            const { fileName, fileSize, timestamp } = this.props;
            return (react_1.default.createElement("button", { className: "module-document-list-item__content", onClick: this.props.onClick },
                react_1.default.createElement("div", { className: "module-document-list-item__icon" }),
                react_1.default.createElement("div", { className: "module-document-list-item__metadata" },
                    react_1.default.createElement("span", { className: "module-document-list-item__file-name" }, fileName),
                    react_1.default.createElement("span", { className: "module-document-list-item__file-size" }, typeof fileSize === 'number' ? filesize_1.default(fileSize) : '')),
                react_1.default.createElement("div", { className: "module-document-list-item__date" }, moment_1.default(timestamp).format('ddd, MMM D, Y'))));
        }
    }
    DocumentListItem.defaultProps = {
        shouldShowSeparator: true,
    };
    exports.DocumentListItem = DocumentListItem;
})();