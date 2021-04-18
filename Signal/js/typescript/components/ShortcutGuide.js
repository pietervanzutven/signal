(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.ShortcutGuide = {};

    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const hooks_1 = window.ts.util.hooks;
    const NAVIGATION_SHORTCUTS = [
        {
            description: 'Keyboard--navigate-by-section',
            keys: [['commandOrCtrl', 'T']],
        },
        {
            description: 'Keyboard--previous-conversation',
            keys: [
                ['optionOrAlt', '↑'],
                ['ctrl', 'shift', 'tab'],
            ],
        },
        {
            description: 'Keyboard--next-conversation',
            keys: [
                ['optionOrAlt', '↓'],
                ['ctrl', 'tab'],
            ],
        },
        {
            description: 'Keyboard--previous-unread-conversation',
            keys: [['optionOrAlt', 'shift', '↑']],
        },
        {
            description: 'Keyboard--next-unread-conversation',
            keys: [['optionOrAlt', 'shift', '↓']],
        },
        {
            description: 'Keyboard--conversation-by-index',
            keys: [['commandOrCtrl', '1 to 9']],
        },
        {
            description: 'Keyboard--preferences',
            keys: [['commandOrCtrl', ',']],
        },
        {
            description: 'Keyboard--open-conversation-menu',
            keys: [['commandOrCtrl', 'shift', 'L']],
        },
        {
            description: 'Keyboard--search',
            keys: [['commandOrCtrl', 'F']],
        },
        {
            description: 'Keyboard--search-in-conversation',
            keys: [['commandOrCtrl', 'shift', 'F']],
        },
        {
            description: 'Keyboard--focus-composer',
            keys: [['commandOrCtrl', 'shift', 'T']],
        },
        {
            description: 'Keyboard--open-all-media-view',
            keys: [['commandOrCtrl', 'shift', 'M']],
        },
        {
            description: 'Keyboard--open-emoji-chooser',
            keys: [['commandOrCtrl', 'shift', 'J']],
        },
        {
            description: 'Keyboard--open-sticker-chooser',
            keys: [['commandOrCtrl', 'shift', 'S']],
        },
        {
            description: 'Keyboard--begin-recording-voice-note',
            keys: [['commandOrCtrl', 'shift', 'V']],
        },
        {
            description: 'Keyboard--archive-conversation',
            keys: [['commandOrCtrl', 'shift', 'A']],
        },
        {
            description: 'Keyboard--unarchive-conversation',
            keys: [['commandOrCtrl', 'shift', 'U']],
        },
        {
            description: 'Keyboard--scroll-to-top',
            keys: [['commandOrCtrl', '↑']],
        },
        {
            description: 'Keyboard--scroll-to-bottom',
            keys: [['commandOrCtrl', '↓']],
        },
        {
            description: 'Keyboard--close-curent-conversation',
            keys: [['commandOrCtrl', 'shift', 'C']],
        },
    ];
    const MESSAGE_SHORTCUTS = [
        {
            description: 'Keyboard--default-message-action',
            keys: [['enter']],
        },
        {
            description: 'Keyboard--view-details-for-selected-message',
            keys: [['commandOrCtrl', 'D']],
        },
        {
            description: 'Keyboard--toggle-reply',
            keys: [['commandOrCtrl', 'shift', 'R']],
        },
        {
            description: 'Keyboard--toggle-reaction-picker',
            keys: [['commandOrCtrl', 'shift', 'E']],
        },
        {
            description: 'Keyboard--save-attachment',
            keys: [['commandOrCtrl', 'S']],
        },
        {
            description: 'Keyboard--delete-message',
            keys: [['commandOrCtrl', 'shift', 'D']],
        },
    ];
    const COMPOSER_SHORTCUTS = [
        {
            description: 'Keyboard--add-newline',
            keys: [['shift', 'enter']],
        },
        {
            description: 'Keyboard--expand-composer',
            keys: [['commandOrCtrl', 'shift', 'X']],
        },
        {
            description: 'Keyboard--send-in-expanded-composer',
            keys: [['commandOrCtrl', 'enter']],
        },
        {
            description: 'Keyboard--attach-file',
            keys: [['commandOrCtrl', 'U']],
        },
        {
            description: 'Keyboard--remove-draft-link-preview',
            keys: [['commandOrCtrl', 'P']],
        },
        {
            description: 'Keyboard--remove-draft-attachments',
            keys: [['commandOrCtrl', 'shift', 'P']],
        },
    ];
    exports.ShortcutGuide = (props) => {
        const focusRef = React.useRef(null);
        const { i18n, close, hasInstalledStickers, platform } = props;
        const isMacOS = platform === 'darwin';
        // Restore focus on teardown
        hooks_1.useRestoreFocus(focusRef);
        return (React.createElement("div", { className: "module-shortcut-guide" },
            React.createElement("div", { className: "module-shortcut-guide__header" },
                React.createElement("div", { className: "module-shortcut-guide__header-text" }, i18n('Keyboard--header')),
                React.createElement("button", { className: "module-shortcut-guide__header-close", onClick: close, title: i18n('close-popup') })),
            React.createElement("div", { className: "module-shortcut-guide__scroll-container", ref: focusRef, tabIndex: -1 },
                React.createElement("div", { className: "module-shortcut-guide__section-container" },
                    React.createElement("div", { className: "module-shortcut-guide__section" },
                        React.createElement("div", { className: "module-shortcut-guide__section-header" }, i18n('Keyboard--navigation-header')),
                        React.createElement("div", { className: "module-shortcut-guide__section-list" }, NAVIGATION_SHORTCUTS.map((shortcut, index) => {
                            if (!hasInstalledStickers &&
                                shortcut.description === 'Keyboard--open-sticker-chooser') {
                                return null;
                            }
                            return renderShortcut(shortcut, index, isMacOS, i18n);
                        }))),
                    React.createElement("div", { className: "module-shortcut-guide__section" },
                        React.createElement("div", { className: "module-shortcut-guide__section-header" }, i18n('Keyboard--messages-header')),
                        React.createElement("div", { className: "module-shortcut-guide__section-list" }, MESSAGE_SHORTCUTS.map((shortcut, index) => renderShortcut(shortcut, index, isMacOS, i18n)))),
                    React.createElement("div", { className: "module-shortcut-guide__section" },
                        React.createElement("div", { className: "module-shortcut-guide__section-header" }, i18n('Keyboard--composer-header')),
                        React.createElement("div", { className: "module-shortcut-guide__section-list" }, COMPOSER_SHORTCUTS.map((shortcut, index) => renderShortcut(shortcut, index, isMacOS, i18n))))))));
    };
    function renderShortcut(shortcut, index, isMacOS, i18n) {
        return (React.createElement("div", { key: index, className: "module-shortcut-guide__shortcut", tabIndex: 0 },
            React.createElement("div", { className: "module-shortcut-guide__shortcut__description" }, i18n(shortcut.description)),
            React.createElement("div", { className: "module-shortcut-guide__shortcut__key-container" }, shortcut.keys.map((keys, outerIndex) => (React.createElement("div", { key: outerIndex, className: "module-shortcut-guide__shortcut__key-inner-container" }, keys.map((key, mapIndex) => {
                let label = key;
                let isSquare = true;
                if (key === 'commandOrCtrl' && isMacOS) {
                    label = '⌘';
                }
                if (key === 'commandOrCtrl' && !isMacOS) {
                    label = i18n('Keyboard--Key--ctrl');
                    isSquare = false;
                }
                if (key === 'optionOrAlt' && isMacOS) {
                    label = i18n('Keyboard--Key--option');
                    isSquare = false;
                }
                if (key === 'optionOrAlt' && !isMacOS) {
                    label = i18n('Keyboard--Key--alt');
                    isSquare = false;
                }
                if (key === 'ctrl') {
                    label = i18n('Keyboard--Key--ctrl');
                    isSquare = false;
                }
                if (key === 'shift') {
                    label = i18n('Keyboard--Key--shift');
                    isSquare = false;
                }
                if (key === 'enter') {
                    label = i18n('Keyboard--Key--enter');
                    isSquare = false;
                }
                if (key === 'tab') {
                    label = i18n('Keyboard--Key--tab');
                    isSquare = false;
                }
                if (key === '1 to 9') {
                    label = i18n('Keyboard--Key--one-to-nine-range');
                    isSquare = false;
                }
                return (React.createElement("span", {
                    key: mapIndex, className: classnames_1.default('module-shortcut-guide__shortcut__key', isSquare
                        ? 'module-shortcut-guide__shortcut__key--square'
                        : null)
                }, label));
            })))))));
    }
})();