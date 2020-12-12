(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Avatar = {};

    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(window.react);
    const classnames_1 = __importDefault(window.classnames);
    const getInitials_1 = window.ts.util.getInitials;
    class Avatar extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.handleImageErrorBound = this.handleImageError.bind(this);
            this.state = {
                imageBroken: false,
            };
        }
        handleImageError() {
            // tslint:disable-next-line no-console
            console.log('Avatar: Image failed to load; failing over to placeholder');
            this.setState({
                imageBroken: true,
            });
        }
        renderImage() {
            const { avatarPath, i18n, name, phoneNumber, profileName } = this.props;
            const { imageBroken } = this.state;
            const hasImage = avatarPath && !imageBroken;
            if (!hasImage) {
                return null;
            }
            const title = `${name || phoneNumber}${!name && profileName ? ` ~${profileName}` : ''}`;
            return (react_1.default.createElement("img", { onError: this.handleImageErrorBound, alt: i18n('contactAvatarAlt', [title]), src: avatarPath }));
        }
        renderNoImage() {
            const { conversationType, name, noteToSelf, size } = this.props;
            const initials = getInitials_1.getInitials(name);
            const isGroup = conversationType === 'group';
            if (noteToSelf) {
                return (react_1.default.createElement("div", { className: classnames_1.default('module-avatar__icon', 'module-avatar__icon--note-to-self', `module-avatar__icon--${size}`) }));
            }
            if (!isGroup && initials) {
                return (react_1.default.createElement("div", { className: classnames_1.default('module-avatar__label', `module-avatar__label--${size}`) }, initials));
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-avatar__icon', `module-avatar__icon--${conversationType}`, `module-avatar__icon--${size}`) }));
        }
        render() {
            const { avatarPath, color, size, noteToSelf } = this.props;
            const { imageBroken } = this.state;
            const hasImage = !noteToSelf && avatarPath && !imageBroken;
            if (size !== 28 && size !== 36 && size !== 48 && size !== 80) {
                throw new Error(`Size ${size} is not supported!`);
            }
            return (react_1.default.createElement("div", { className: classnames_1.default('module-avatar', `module-avatar--${size}`, hasImage ? 'module-avatar--with-image' : 'module-avatar--no-image', !hasImage ? `module-avatar--${color}` : null) }, hasImage ? this.renderImage() : this.renderNoImage()));
        }
    }
    exports.Avatar = Avatar;
})();