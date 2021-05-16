require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Avatar_1 = require("./Avatar");
    const CallingButton_1 = require("./CallingButton");
    const Calling_1 = require("../types/Calling");
    class CallScreen extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.updateAcceptedTimer = () => {
                const { callDetails } = this.props;
                if (!callDetails) {
                    return;
                }
                if (callDetails.acceptedTime) {
                    this.setState({
                        acceptedDuration: Date.now() - callDetails.acceptedTime,
                    });
                }
            };
            this.handleKeyDown = (event) => {
                const { callDetails } = this.props;
                if (!callDetails) {
                    return;
                }
                let eventHandled = false;
                if (event.shiftKey && (event.key === 'V' || event.key === 'v')) {
                    this.toggleVideo();
                    eventHandled = true;
                }
                else if (event.shiftKey && (event.key === 'M' || event.key === 'm')) {
                    this.toggleAudio();
                    eventHandled = true;
                }
                if (eventHandled) {
                    event.preventDefault();
                    event.stopPropagation();
                    this.showControls();
                }
            };
            this.showControls = () => {
                const { showControls } = this.state;
                if (!showControls) {
                    this.setState({
                        showControls: true,
                    });
                }
                this.fadeControls();
            };
            this.fadeControls = () => {
                if (this.controlsFadeTimer) {
                    clearTimeout(this.controlsFadeTimer);
                }
                this.controlsFadeTimer = setTimeout(() => {
                    this.setState({
                        showControls: false,
                    });
                }, 5000);
            };
            this.toggleAudio = () => {
                const { callDetails, hasLocalAudio, setLocalAudio } = this.props;
                if (!callDetails) {
                    return;
                }
                setLocalAudio({
                    callId: callDetails.callId,
                    enabled: !hasLocalAudio,
                });
            };
            this.toggleVideo = () => {
                const { callDetails, hasLocalVideo, setLocalVideo } = this.props;
                if (!callDetails) {
                    return;
                }
                setLocalVideo({ callId: callDetails.callId, enabled: !hasLocalVideo });
            };
            this.state = {
                acceptedDuration: null,
                showControls: true,
            };
            this.interval = null;
            this.controlsFadeTimer = null;
            this.localVideoRef = react_1.default.createRef();
            this.remoteVideoRef = react_1.default.createRef();
        }
        componentDidMount() {
            const { setLocalPreview, setRendererCanvas } = this.props;
            // It's really jump with a value of 500ms.
            this.interval = setInterval(this.updateAcceptedTimer, 100);
            this.fadeControls();
            document.addEventListener('keydown', this.handleKeyDown);
            setLocalPreview({ element: this.localVideoRef });
            setRendererCanvas({ element: this.remoteVideoRef });
        }
        componentWillUnmount() {
            const { setLocalPreview, setRendererCanvas } = this.props;
            document.removeEventListener('keydown', this.handleKeyDown);
            if (this.interval) {
                clearInterval(this.interval);
            }
            if (this.controlsFadeTimer) {
                clearTimeout(this.controlsFadeTimer);
            }
            setLocalPreview({ element: undefined });
            setRendererCanvas({ element: undefined });
        }
        render() {
            const { callDetails, callState, hangUp, hasLocalAudio, hasLocalVideo, hasRemoteVideo, i18n, togglePip, toggleSettings, } = this.props;
            const { showControls } = this.state;
            const isAudioOnly = !hasLocalVideo && !hasRemoteVideo;
            if (!callDetails || !callState) {
                return null;
            }
            const controlsFadeClass = classnames_1.default({
                'module-ongoing-call__controls--fadeIn': (showControls || isAudioOnly) && callState !== Calling_1.CallState.Accepted,
                'module-ongoing-call__controls--fadeOut': !showControls && !isAudioOnly && callState === Calling_1.CallState.Accepted,
            });
            const videoButtonType = hasLocalVideo
                ? CallingButton_1.CallingButtonType.VIDEO_ON
                : CallingButton_1.CallingButtonType.VIDEO_OFF;
            const audioButtonType = hasLocalAudio
                ? CallingButton_1.CallingButtonType.AUDIO_ON
                : CallingButton_1.CallingButtonType.AUDIO_OFF;
            return (react_1.default.createElement("div", { className: "module-calling__container", onMouseMove: this.showControls, role: "group" },
                react_1.default.createElement("div", { className: classnames_1.default('module-calling__header', 'module-ongoing-call__header', controlsFadeClass) },
                    react_1.default.createElement("div", { className: "module-calling__header--header-name" }, callDetails.title),
                    this.renderMessage(callState),
                    react_1.default.createElement("div", { className: "module-calling-tools" },
                        react_1.default.createElement("button", { type: "button", "aria-label": i18n('callingDeviceSelection__settings'), className: "module-calling-tools__button module-calling-button__settings", onClick: toggleSettings }),
                        react_1.default.createElement("button", { type: "button", "aria-label": i18n('calling__pip'), className: "module-calling-tools__button module-calling-button__pip", onClick: togglePip }))),
                hasRemoteVideo
                    ? this.renderRemoteVideo()
                    : this.renderAvatar(callDetails),
                hasLocalVideo ? this.renderLocalVideo() : null,
                react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__actions', controlsFadeClass) },
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: videoButtonType, i18n: i18n, onClick: this.toggleVideo, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, { buttonType: audioButtonType, i18n: i18n, onClick: this.toggleAudio, tooltipDistance: 24 }),
                    react_1.default.createElement(CallingButton_1.CallingButton, {
                        buttonType: CallingButton_1.CallingButtonType.HANG_UP, i18n: i18n, onClick: () => {
                            hangUp({ callId: callDetails.callId });
                        }, tooltipDistance: 24
                    }))));
        }
        renderAvatar(callDetails) {
            const { i18n } = this.props;
            const { avatarPath, color, name, phoneNumber, profileName, title, } = callDetails;
            return (react_1.default.createElement("div", { className: "module-ongoing-call__remote-video-disabled" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: color || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, title: title, size: 112 })));
        }
        renderLocalVideo() {
            return (react_1.default.createElement("video", { className: "module-ongoing-call__local-video", ref: this.localVideoRef, autoPlay: true }));
        }
        renderRemoteVideo() {
            return (react_1.default.createElement("canvas", { className: "module-ongoing-call__remote-video-enabled", ref: this.remoteVideoRef }));
        }
        renderMessage(callState) {
            const { i18n } = this.props;
            const { acceptedDuration } = this.state;
            let message = null;
            if (callState === Calling_1.CallState.Prering) {
                message = i18n('outgoingCallPrering');
            }
            else if (callState === Calling_1.CallState.Ringing) {
                message = i18n('outgoingCallRinging');
            }
            else if (callState === Calling_1.CallState.Reconnecting) {
                message = i18n('callReconnecting');
            }
            else if (callState === Calling_1.CallState.Accepted && acceptedDuration) {
                message = i18n('callDuration', [this.renderDuration(acceptedDuration)]);
            }
            if (!message) {
                return null;
            }
            return react_1.default.createElement("div", { className: "module-ongoing-call__header-message" }, message);
        }
        // eslint-disable-next-line class-methods-use-this
        renderDuration(ms) {
            const secs = Math.floor((ms / 1000) % 60)
                .toString()
                .padStart(2, '0');
            const mins = Math.floor((ms / 60000) % 60)
                .toString()
                .padStart(2, '0');
            const hours = Math.floor(ms / 3600000);
            if (hours > 0) {
                return `${hours}:${mins}:${secs}`;
            }
            return `${mins}:${secs}`;
        }
    }
    exports.CallScreen = CallScreen;
});