(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery.MediaGallery = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const moment_1 = __importDefault(window.moment);
    const AttachmentSection_1 = window.ts.components.conversation.media_gallery.AttachmentSection;
    const EmptyState_1 = window.ts.components.conversation.media_gallery.EmptyState;
    const groupMediaItemsByDate_1 = window.ts.components.conversation.media_gallery.groupMediaItemsByDate;
    const missingCaseError_1 = require("../../../ts/util/missingCaseError");
    const MONTH_FORMAT = 'MMMM YYYY';
    const Tab = ({ isSelected, label, onSelect, type, }) => {
        const handleClick = onSelect
            ? () => {
                onSelect({ type });
            }
            : undefined;
        return (react_1.default.createElement("div", { className: classnames_1.default('module-media-gallery__tab', isSelected ? 'module-media-gallery__tab--active' : null), onClick: handleClick, role: "tab", tabIndex: 0 }, label));
    };
    class MediaGallery extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.focusRef = react_1.default.createRef();
            this.state = {
                selectedTab: 'media',
            };
            this.handleTabSelect = (event) => {
                this.setState({ selectedTab: event.type });
            };
        }
        componentDidMount() {
            // When this component is created, it's initially not part of the DOM, and then it's
            //   added off-screen and animated in. This ensures that the focus takes.
            setTimeout(() => {
                if (this.focusRef.current) {
                    this.focusRef.current.focus();
                }
            });
        }
        render() {
            const { selectedTab } = this.state;
            return (react_1.default.createElement("div", { className: "module-media-gallery", tabIndex: -1, ref: this.focusRef },
                react_1.default.createElement("div", { className: "module-media-gallery__tab-container" },
                    react_1.default.createElement(Tab, { label: "Media", type: "media", isSelected: selectedTab === 'media', onSelect: this.handleTabSelect }),
                    react_1.default.createElement(Tab, { label: "Documents", type: "documents", isSelected: selectedTab === 'documents', onSelect: this.handleTabSelect })),
                react_1.default.createElement("div", { className: "module-media-gallery__content" }, this.renderSections())));
        }
        renderSections() {
            const { i18n, media, documents, onItemClick } = this.props;
            const { selectedTab } = this.state;
            const mediaItems = selectedTab === 'media' ? media : documents;
            const type = selectedTab;
            if (!mediaItems || mediaItems.length === 0) {
                const label = (() => {
                    switch (type) {
                        case 'media':
                            return i18n('mediaEmptyState');
                        case 'documents':
                            return i18n('documentsEmptyState');
                        default:
                            throw missingCaseError_1.missingCaseError(type);
                    }
                })();
                return react_1.default.createElement(EmptyState_1.EmptyState, { "data-test": "EmptyState", label: label });
            }
            const now = Date.now();
            const sections = groupMediaItemsByDate_1.groupMediaItemsByDate(now, mediaItems).map(section => {
                const first = section.mediaItems[0];
                const { message } = first;
                const date = moment_1.default(message.received_at);
                const header = section.type === 'yearMonth'
                    ? date.format(MONTH_FORMAT)
                    : i18n(section.type);
                return (react_1.default.createElement(AttachmentSection_1.AttachmentSection, { key: header, header: header, i18n: i18n, type: type, mediaItems: section.mediaItems, onItemClick: onItemClick }));
            });
            return react_1.default.createElement("div", { className: "module-media-gallery__sections" }, sections);
        }
    }
    exports.MediaGallery = MediaGallery;
})();