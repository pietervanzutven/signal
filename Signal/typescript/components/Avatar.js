(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.components = window.ts.components || {};
    const exports = window.ts.components.Avatar = {};

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
    const React = __importStar(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const getInitials_1 = require("../util/getInitials");
    class Avatar extends React.Component {
        constructor(props) {
            super(props);
            this.handleImageErrorBound = this.handleImageError.bind(this);
            this.state = {
                lastAvatarPath: props.avatarPath,
                imageBroken: false,
            };
        }
        static getDerivedStateFromProps(props, state) {
            if (props.avatarPath !== state.lastAvatarPath) {
                return Object.assign(Object.assign({}, state), { lastAvatarPath: props.avatarPath, imageBroken: false });
            }
            return state;
        }
        handleImageError() {
            window.log.info('Avatar: Image failed to load; failing over to placeholder');
            this.setState({
                imageBroken: true,
            });
        }
        renderImage() {
            const { avatarPath, i18n, title } = this.props;
            const { imageBroken } = this.state;
            if (!avatarPath || imageBroken) {
                return null;
            }
            return (React.createElement("img", { onError: this.handleImageErrorBound, alt: i18n('contactAvatarAlt', [title]), src: avatarPath }));
        }
        renderNoImage() {
            const { conversationType, name, noteToSelf, profileName, size, } = this.props;
            const initials = getInitials_1.getInitials(name || profileName);
            const isGroup = conversationType === 'group';
            if (noteToSelf) {
                return (React.createElement("div", { className: classnames_1.default('module-avatar__icon', 'module-avatar__icon--note-to-self', `module-avatar__icon--${size}`) }));
            }
            if (!isGroup && initials) {
                return (React.createElement("div", { className: classnames_1.default('module-avatar__label', `module-avatar__label--${size}`) }, initials));
            }
            return (React.createElement("div", { className: classnames_1.default('module-avatar__icon', `module-avatar__icon--${conversationType}`, `module-avatar__icon--${size}`) }));
        }
        render() {
            const { avatarPath, color, innerRef, noteToSelf, onClick, size, className, } = this.props;
            const { imageBroken } = this.state;
            const hasImage = !noteToSelf && avatarPath && !imageBroken;
            if (![28, 32, 52, 80, 112].includes(size)) {
                throw new Error(`Size ${size} is not supported!`);
            }
            let contents;
            if (onClick) {
                contents = (React.createElement("button", { type: "button", className: "module-avatar-button", onClick: onClick }, hasImage ? this.renderImage() : this.renderNoImage()));
            }
            else {
                contents = hasImage ? this.renderImage() : this.renderNoImage();
            }
            return (React.createElement("div", { className: classnames_1.default('module-avatar', `module-avatar--${size}`, hasImage ? 'module-avatar--with-image' : 'module-avatar--no-image', !hasImage ? `module-avatar--${color}` : null, className), ref: innerRef }, contents));
        }
    }
    exports.Avatar = Avatar;
})();