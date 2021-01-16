(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.MainHeader = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const lodash_1 = window.lodash;
    const react_popper_1 = window.react_popper;
    const react_dom_1 = window.react_dom;
    const Whisper_1 = window.ts.shims.Whisper;
    const Avatar_1 = window.ts.components.Avatar;
    const AvatarPopup_1 = window.ts.components.AvatarPopup;
    class MainHeader extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.handleOutsideClick = ({ target }) => {
                const { popperRoot, showingAvatarPopup } = this.state;
                if (showingAvatarPopup &&
                    popperRoot &&
                    !popperRoot.contains(target)) {
                    this.hideAvatarPopup();
                }
            };
            this.handleOutsideKeyDown = (event) => {
                if (event.key === 'Escape') {
                    this.hideAvatarPopup();
                }
            };
            this.showAvatarPopup = () => {
                this.setState({
                    showingAvatarPopup: true,
                });
                document.addEventListener('click', this.handleOutsideClick);
                document.addEventListener('keydown', this.handleOutsideKeyDown);
            };
            this.hideAvatarPopup = () => {
                document.removeEventListener('click', this.handleOutsideClick);
                document.removeEventListener('keydown', this.handleOutsideKeyDown);
                this.setState({
                    showingAvatarPopup: false,
                });
            };
            // tslint:disable-next-line member-ordering
            this.search = lodash_1.debounce((searchTerm) => {
                const { i18n, ourNumber, regionCode, searchDiscussions, searchMessages, searchConversationId, } = this.props;
                if (searchDiscussions && !searchConversationId) {
                    searchDiscussions(searchTerm, {
                        noteToSelf: i18n('noteToSelf').toLowerCase(),
                        ourNumber,
                    });
                }
                if (searchMessages) {
                    searchMessages(searchTerm, {
                        searchConversationId,
                        regionCode,
                    });
                }
            }, 200);
            this.updateSearch = (event) => {
                const { updateSearchTerm, clearConversationSearch, clearSearch, searchConversationId, } = this.props;
                const searchTerm = event.currentTarget.value;
                if (!searchTerm) {
                    if (searchConversationId) {
                        clearConversationSearch();
                    }
                    else {
                        clearSearch();
                    }
                    return;
                }
                if (updateSearchTerm) {
                    updateSearchTerm(searchTerm);
                }
                if (searchTerm.length < 2) {
                    return;
                }
                this.search(searchTerm);
            };
            this.clearSearch = () => {
                const { clearSearch } = this.props;
                clearSearch();
                this.setFocus();
            };
            this.clearConversationSearch = () => {
                const { clearConversationSearch } = this.props;
                clearConversationSearch();
                this.setFocus();
            };
            this.handleKeyDown = (event) => {
                const { clearConversationSearch, clearSearch, searchConversationId, searchTerm, } = this.props;
                if (event.key !== 'Escape') {
                    return;
                }
                if (searchConversationId && searchTerm) {
                    clearConversationSearch();
                }
                else {
                    clearSearch();
                }
                event.preventDefault();
                event.stopPropagation();
            };
            this.handleXButton = () => {
                const { searchConversationId, clearConversationSearch, clearSearch, } = this.props;
                if (searchConversationId) {
                    clearConversationSearch();
                }
                else {
                    clearSearch();
                }
                this.setFocus();
            };
            this.setFocus = () => {
                if (this.inputRef.current) {
                    // @ts-ignore
                    this.inputRef.current.focus();
                }
            };
            this.setSelected = () => {
                if (this.inputRef.current) {
                    // @ts-ignore
                    this.inputRef.current.select();
                }
            };
            this.inputRef = react_1.default.createRef();
            this.state = {
                showingAvatarPopup: false,
                popperRoot: null,
            };
        }
        componentDidMount() {
            const popperRoot = document.createElement('div');
            document.body.appendChild(popperRoot);
            this.setState({
                popperRoot,
            });
        }
        componentDidUpdate(prevProps) {
            const { searchConversationId, startSearchCounter } = this.props;
            // When user chooses to search in a given conversation we focus the field for them
            if (searchConversationId &&
                searchConversationId !== prevProps.searchConversationId) {
                this.setFocus();
            }
            // When user chooses to start a new search, we focus the field
            if (startSearchCounter !== prevProps.startSearchCounter) {
                this.setSelected();
            }
        }
        componentWillUnmount() {
            const { popperRoot } = this.state;
            if (popperRoot) {
                document.body.removeChild(popperRoot);
                document.removeEventListener('click', this.handleOutsideClick);
                document.removeEventListener('keydown', this.handleOutsideKeyDown);
            }
        }
        // tslint:disable-next-line:max-func-body-length
        render() {
            const { avatarPath, color, i18n, name, phoneNumber, profileName, searchConversationId, searchConversationName, searchTerm, showArchivedConversations, } = this.props;
            const { showingAvatarPopup, popperRoot } = this.state;
            const placeholder = searchConversationName
                ? i18n('searchIn', [searchConversationName])
                : i18n('search');
            return (react_1.default.createElement("div", { className: "module-main-header" },
                react_1.default.createElement(react_popper_1.Manager, null,
                    react_1.default.createElement(react_popper_1.Reference, null, ({ ref }) => (react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 28, innerRef: ref, onClick: this.showAvatarPopup }))),
                    showingAvatarPopup && popperRoot
                        ? react_dom_1.createPortal(react_1.default.createElement(react_popper_1.Popper, { placement: "bottom-end" }, ({ ref, style }) => (react_1.default.createElement(AvatarPopup_1.AvatarPopup, {
                            innerRef: ref, i18n: i18n, style: style, color: color, conversationType: "direct", name: name, phoneNumber: phoneNumber, profileName: profileName, avatarPath: avatarPath, size: 28, onViewPreferences: () => {
                                Whisper_1.showSettings();
                                this.hideAvatarPopup();
                            }, onViewArchive: () => {
                                showArchivedConversations();
                                this.hideAvatarPopup();
                            }
                        }))), popperRoot)
                        : null),
                react_1.default.createElement("div", { className: "module-main-header__search" },
                    searchConversationId ? (react_1.default.createElement("button", { className: "module-main-header__search__in-conversation-pill", onClick: this.clearSearch, tabIndex: -1 },
                        react_1.default.createElement("div", { className: "module-main-header__search__in-conversation-pill__avatar-container" },
                            react_1.default.createElement("div", { className: "module-main-header__search__in-conversation-pill__avatar" })),
                        react_1.default.createElement("div", { className: "module-main-header__search__in-conversation-pill__x-button" }))) : (react_1.default.createElement("button", { className: "module-main-header__search__icon", onClick: this.setFocus, tabIndex: -1 })),
                    react_1.default.createElement("input", {
                        type: "text", ref: this.inputRef, className: classnames_1.default('module-main-header__search__input', searchTerm
                            ? 'module-main-header__search__input--with-text'
                            : null, searchConversationId
                            ? 'module-main-header__search__input--in-conversation'
                            : null), placeholder: placeholder, dir: "auto", onKeyDown: this.handleKeyDown, value: searchTerm, onChange: this.updateSearch
                    }),
                    searchTerm ? (react_1.default.createElement("button", { tabIndex: -1, className: "module-main-header__search__cancel-icon", onClick: this.handleXButton })) : null)));
        }
    }
    exports.MainHeader = MainHeader;
})();