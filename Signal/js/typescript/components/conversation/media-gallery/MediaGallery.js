(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    window.ts.components.conversation = window.ts.components.conversation || {};
    window.ts.components.conversation.media_gallery = window.ts.components.conversation.media_gallery || {};
    const exports = window.ts.components.conversation.media_gallery;

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * @prettier
     */
    const react_1 = __importDefault(window.react);
    const moment_1 = __importDefault(window.moment);
    const AttachmentSection_1 = window.ts.components.conversation.media_gallery.AttachmentSection;
    const groupMessagesByDate_1 = window.ts.components.conversation.media_gallery.groupMessagesByDate;
    const MONTH_FORMAT = 'MMMM YYYY';
    const COLOR_GRAY = '#f3f3f3';
    const tabStyle = {
        width: '100%',
        backgroundColor: COLOR_GRAY,
        padding: 20,
        textAlign: 'center',
    };
    const styles = {
        tabContainer: {
            cursor: 'pointer',
            display: 'flex',
            width: '100%',
        },
        tab: {
            default: tabStyle,
            active: Object.assign({}, tabStyle, { borderBottom: '2px solid #08f' }),
        },
        attachmentsContainer: {
            padding: 20,
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
            return (react_1.default.createElement("div", null,
                react_1.default.createElement("div", { style: styles.tabContainer },
                    react_1.default.createElement(Tab, { label: "Media", type: "media", isSelected: selectedTab === 'media', onSelect: this.handleTabSelect })),
                react_1.default.createElement("div", { style: styles.attachmentsContainer }, this.renderSections())));
        }
        renderSections() {
            const { i18n, media, documents, onItemClick } = this.props;
            const { selectedTab } = this.state;
            const messages = selectedTab === 'media' ? media : documents;
            const type = selectedTab;
            if (!messages || messages.length === 0) {
                return null;
            }
            const now = Date.now();
            const sections = groupMessagesByDate_1.groupMessagesByDate(now, messages);
            return sections.map(section => {
                const first = section.messages[0];
                const date = moment_1.default(first.received_at);
                const header = section.type === 'yearMonth'
                    ? date.format(MONTH_FORMAT)
                    : i18n(section.type);
                return (react_1.default.createElement(AttachmentSection_1.AttachmentSection, { key: header, header: header, i18n: i18n, type: type, messages: section.messages, onItemClick: onItemClick }));
            });
        }
    }
    exports.MediaGallery = MediaGallery;
})();