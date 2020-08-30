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
    const moment_1 = __importDefault(window.moment);
    const AttachmentSection_1 = window.ts.components.conversation.media_gallery.AttachmentSection;;
    const EmptyState_1 = window.ts.components.conversation.media_gallery.EmptyState;
    const groupMessagesByDate_1 = window.ts.components.conversation.media_gallery.groupMessagesByDate;
    const missingCaseError_1 = window.ts.util.missingCaseError;
    const MONTH_FORMAT = 'MMMM YYYY';
    const COLOR_GRAY = '#f3f3f3';
    const tabStyle = {
        width: '100%',
        backgroundColor: COLOR_GRAY,
        padding: 20,
        textAlign: 'center',
    };
    const styles = {
        container: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            width: '100%',
            height: '100%',
        },
        tabContainer: {
            display: 'flex',
            flexGrow: 0,
            flexShrink: 0,
            cursor: 'pointer',
            width: '100%',
        },
        tab: {
            default: tabStyle,
            active: Object.assign({}, tabStyle, { borderBottom: '2px solid #08f' }),
        },
        contentContainer: {
            display: 'flex',
            flexGrow: 1,
            overflowY: 'auto',
            padding: 20,
        },
        sectionContainer: {
            display: 'flex',
            flexGrow: 1,
            flexDirection: 'column',
        },
    };
    const Tab = ({ isSelected, label, onSelect, type, }) => {
        const handleClick = onSelect ? () => onSelect({ type }) : undefined;
        return (react_1.default.createElement("div", { style: isSelected ? styles.tab.active : styles.tab.default, onClick: handleClick }, label));
    };
    class MediaGallery extends react_1.default.Component {
        constructor() {
            super(...arguments);
            this.state = {
                selectedTab: 'media',
            };
            this.handleTabSelect = (event) => {
                this.setState({ selectedTab: event.type });
            };
        }
        render() {
            const { selectedTab } = this.state;
            return (react_1.default.createElement("div", { style: styles.container },
                react_1.default.createElement("div", { style: styles.tabContainer },
                    react_1.default.createElement(Tab, { label: "Media", type: "media", isSelected: selectedTab === 'media', onSelect: this.handleTabSelect }),
                    react_1.default.createElement(Tab, { label: "Documents", type: "documents", isSelected: selectedTab === 'documents', onSelect: this.handleTabSelect })),
                react_1.default.createElement("div", { style: styles.contentContainer }, this.renderSections())));
        }
        renderSections() {
            const { i18n, media, documents, onItemClick } = this.props;
            const { selectedTab } = this.state;
            const messages = selectedTab === 'media' ? media : documents;
            const type = selectedTab;
            if (!messages || messages.length === 0) {
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
            const sections = groupMessagesByDate_1.groupMessagesByDate(now, messages).map(section => {
                const first = section.messages[0];
                const date = moment_1.default(first.received_at);
                const header = section.type === 'yearMonth'
                    ? date.format(MONTH_FORMAT)
                    : i18n(section.type);
                return (react_1.default.createElement(AttachmentSection_1.AttachmentSection, { key: header, header: header, i18n: i18n, type: type, messages: section.messages, onItemClick: onItemClick }));
            });
            return react_1.default.createElement("div", { style: styles.sectionContainer }, sections);
        }
    }
    exports.MediaGallery = MediaGallery;
})();