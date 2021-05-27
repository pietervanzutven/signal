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
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const moment_1 = __importDefault(require("moment"));
    const filesize_1 = __importDefault(require("filesize"));
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
            const { fileName, fileSize, onClick, timestamp } = this.props;
            return (react_1.default.createElement("button", { type: "button", className: "module-document-list-item__content", onClick: onClick },
                react_1.default.createElement("div", { className: "module-document-list-item__icon" }),
                react_1.default.createElement("div", { className: "module-document-list-item__metadata" },
                    react_1.default.createElement("span", { className: "module-document-list-item__file-name" }, fileName),
                    react_1.default.createElement("span", { className: "module-document-list-item__file-size" }, typeof fileSize === 'number'
                        ? filesize_1.default(fileSize, { round: 0 })
                        : '')),
                react_1.default.createElement("div", { className: "module-document-list-item__date" }, moment_1.default(timestamp).format('ddd, MMM D, Y'))));
        }
    }
    exports.DocumentListItem = DocumentListItem;
    DocumentListItem.defaultProps = {
        shouldShowSeparator: true,
    };
})();