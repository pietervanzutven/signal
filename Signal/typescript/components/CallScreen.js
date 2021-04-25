require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const react_1 = __importDefault(require("react"));
    const classnames_1 = __importDefault(require("classnames"));
    const Avatar_1 = require("./Avatar");
    const Calling_1 = require("../types/Calling");
    const CallingButton = ({ classNameSuffix, onClick, }) => {
        const className = classnames_1.default('module-ongoing-call__icon', `module-ongoing-call__icon${classNameSuffix}`);
        return (react_1.default.createElement("button", { className: className, onClick: onClick },
            react_1.default.createElement("div", null)));
    };
    class CallScreen extends react_1.default.Component {
        constructor(props) {
            super(props);
            this.updateAcceptedTimer = () => {
                const { acceptedTime } = this.state;
                const { callState } = this.props;
                if (acceptedTime) {
                    this.setState({
                        acceptedTime,
                        acceptedDuration: Date.now() - acceptedTime,
                    });
                }
                else if (callState === Calling_1.CallState.Accepted ||
                    callState === Calling_1.CallState.Reconnecting) {
                    this.setState({
                        acceptedTime: Date.now(),
                        acceptedDuration: 1,
                    });
                }
            };
            this.handleKeyDown = (event) => {
                const { callDetails } = this.props;
                if (!callDetails) {
                    return;
                }
                let eventHandled = false;
                if (event.key === 'V') {
                    this.toggleVideo();
                    eventHandled = true;
                }
                else if (event.key === 'M') {
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
                if (!this.state.showControls) {
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
                acceptedTime: null,
                acceptedDuration: null,
                showControls: true,
            };
            this.interval = null;
            this.controlsFadeTimer = null;
            this.localVideoRef = react_1.default.createRef();
            this.remoteVideoRef = react_1.default.createRef();
            this.setVideoCapturerAndRenderer(props.getVideoCapturer(this.localVideoRef), props.getVideoRenderer(this.remoteVideoRef));
        }
        componentDidMount() {
            // It's really jump with a value of 500ms.
            this.interval = setInterval(this.updateAcceptedTimer, 100);
            this.fadeControls();
            document.addEventListener('keydown', this.handleKeyDown);
        }
        componentWillUnmount() {
            document.removeEventListener('keydown', this.handleKeyDown);
            if (this.interval) {
                clearInterval(this.interval);
            }
            if (this.controlsFadeTimer) {
                clearTimeout(this.controlsFadeTimer);
            }
            this.setVideoCapturerAndRenderer(null, null);
        }
        render() {
            const { callDetails, callState, hangUp, hasLocalAudio, hasLocalVideo, hasRemoteVideo, } = this.props;
            const { showControls } = this.state;
            const isAudioOnly = !hasLocalVideo && !hasRemoteVideo;
            if (!callDetails || !callState) {
                return null;
            }
            const controlsFadeClass = classnames_1.default({
                'module-ongoing-call__controls--fadeIn': (showControls || isAudioOnly) && callState !== Calling_1.CallState.Accepted,
                'module-ongoing-call__controls--fadeOut': !showControls && !isAudioOnly && callState === Calling_1.CallState.Accepted,
            });
            const toggleAudioSuffix = hasLocalAudio
                ? '--audio--enabled'
                : '--audio--disabled';
            const toggleVideoSuffix = hasLocalVideo
                ? '--video--enabled'
                : '--video--disabled';
            return (react_1.default.createElement("div", { className: "module-ongoing-call", onMouseMove: this.showControls, role: "group" },
                react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__header', controlsFadeClass) },
                    react_1.default.createElement("div", { className: "module-ongoing-call__header-name" }, callDetails.name),
                    this.renderMessage(callState)),
                hasRemoteVideo
                    ? this.renderRemoteVideo()
                    : this.renderAvatar(callDetails),
                hasLocalVideo ? this.renderLocalVideo() : null,
                react_1.default.createElement("div", { className: classnames_1.default('module-ongoing-call__actions', controlsFadeClass) },
                    react_1.default.createElement(CallingButton, { classNameSuffix: toggleVideoSuffix, onClick: this.toggleVideo }),
                    react_1.default.createElement(CallingButton, { classNameSuffix: toggleAudioSuffix, onClick: this.toggleAudio }),
                    react_1.default.createElement(CallingButton, {
                        classNameSuffix: "--hangup", onClick: () => {
                            hangUp({ callId: callDetails.callId });
                        }
                    }))));
        }
        renderAvatar(callDetails) {
            const { i18n } = this.props;
            const { avatarPath, contactColor, name, phoneNumber, profileName, } = callDetails;
            return (react_1.default.createElement("div", { className: "module-ongoing-call__remote-video-disabled" },
                react_1.default.createElement(Avatar_1.Avatar, { avatarPath: avatarPath, color: contactColor || 'ultramarine', noteToSelf: false, conversationType: "direct", i18n: i18n, name: name, phoneNumber: phoneNumber, profileName: profileName, size: 112 })));
        }
        renderLocalVideo() {
            return (react_1.default.createElement("video", { className: "module-ongoing-call__local-video", ref: this.localVideoRef, autoPlay: true }));
        }
        renderRemoteVideo() {
            return (react_1.default.createElement("canvas", { className: "module-ongoing-call__remote-video-enabled", ref: this.remoteVideoRef }));
        }
        renderMessage(callState) {
            const { i18n } = this.props;
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
            else if (callState === Calling_1.CallState.Accepted &&
                this.state.acceptedDuration) {
                message = i18n('callDuration', [
                    this.renderDuration(this.state.acceptedDuration),
                ]);
            }
            if (!message) {
                return null;
            }
            return react_1.default.createElement("div", { className: "module-ongoing-call__header-message" }, message);
        }
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
        setVideoCapturerAndRenderer(capturer, renderer) {
            const { callDetails, setVideoCapturer, setVideoRenderer } = this.props;
            if (!callDetails) {
                return;
            }
            const { callId } = callDetails;
            setVideoCapturer({
                callId,
                capturer,
            });
            setVideoRenderer({
                callId,
                renderer,
            });
        }
    }
    exports.CallScreen = CallScreen;
});