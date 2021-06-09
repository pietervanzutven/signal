require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    var __importStar = (this && this.__importStar) || function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const React = __importStar(require("react"));
    const ConfirmationModal_1 = require("./ConfirmationModal");
    const Calling_1 = require("../types/Calling");
    const theme_1 = require("../util/theme");
    function localizeDefault(i18n, deviceLabel) {
        return deviceLabel.toLowerCase().startsWith('default')
            ? deviceLabel.replace(/default/i, i18n('callingDeviceSelection__select--default'))
            : deviceLabel;
    }
    function renderAudioOptions(devices, i18n, selectedDevice) {
        if (!devices.length) {
            return (React.createElement("option", { "aria-selected": true }, i18n('callingDeviceSelection__select--no-device')));
        }
        return (React.createElement(React.Fragment, null, devices.map((device) => {
            const isSelected = selectedDevice && selectedDevice.index === device.index;
            return (React.createElement("option", { "aria-selected": isSelected, key: device.index, value: device.index }, localizeDefault(i18n, device.name)));
        })));
    }
    function renderVideoOptions(devices, i18n, selectedCamera) {
        if (!devices.length) {
            return (React.createElement("option", { "aria-selected": true }, i18n('callingDeviceSelection__select--no-device')));
        }
        return (React.createElement(React.Fragment, null, devices.map((device) => {
            const isSelected = selectedCamera === device.deviceId;
            return (React.createElement("option", { "aria-selected": isSelected, key: device.deviceId, value: device.deviceId }, localizeDefault(i18n, device.label)));
        })));
    }
    function createAudioChangeHandler(devices, changeIODevice, type) {
        return (ev) => {
            changeIODevice({
                type,
                selectedDevice: devices[Number(ev.currentTarget.value)],
            });
        };
    }
    function createCameraChangeHandler(changeIODevice) {
        return (ev) => {
            changeIODevice({
                type: Calling_1.CallingDeviceType.CAMERA,
                selectedDevice: String(ev.currentTarget.value),
            });
        };
    }
    exports.CallingDeviceSelection = ({ availableCameras, availableMicrophones, availableSpeakers, changeIODevice, i18n, selectedCamera, selectedMicrophone, selectedSpeaker, toggleSettings, }) => {
        const selectedMicrophoneIndex = selectedMicrophone
            ? selectedMicrophone.index
            : undefined;
        const selectedSpeakerIndex = selectedSpeaker
            ? selectedSpeaker.index
            : undefined;
        return (React.createElement(ConfirmationModal_1.ConfirmationModal, { actions: [], i18n: i18n, theme: theme_1.Theme.Dark, onClose: toggleSettings },
            React.createElement("div", { className: "module-calling-device-selection" },
                React.createElement("button", { type: "button", className: "module-calling-device-selection__close-button", onClick: toggleSettings, tabIndex: 0, "aria-label": i18n('close') })),
            React.createElement("h1", { className: "module-calling-device-selection__title" }, i18n('callingDeviceSelection__settings')),
            React.createElement("label", { htmlFor: "video", className: "module-calling-device-selection__label" }, i18n('callingDeviceSelection__label--video')),
            React.createElement("div", { className: "module-calling-device-selection__select" },
                React.createElement("select", { disabled: !availableCameras.length, name: "video", onChange: createCameraChangeHandler(changeIODevice), value: selectedCamera }, renderVideoOptions(availableCameras, i18n, selectedCamera))),
            React.createElement("label", { htmlFor: "audio-input", className: "module-calling-device-selection__label" }, i18n('callingDeviceSelection__label--audio-input')),
            React.createElement("div", { className: "module-calling-device-selection__select" },
                React.createElement("select", { disabled: !availableMicrophones.length, name: "audio-input", onChange: createAudioChangeHandler(availableMicrophones, changeIODevice, Calling_1.CallingDeviceType.MICROPHONE), value: selectedMicrophoneIndex }, renderAudioOptions(availableMicrophones, i18n, selectedMicrophone))),
            React.createElement("label", { htmlFor: "audio-output", className: "module-calling-device-selection__label" }, i18n('callingDeviceSelection__label--audio-output')),
            React.createElement("div", { className: "module-calling-device-selection__select" },
                React.createElement("select", { disabled: !availableSpeakers.length, name: "audio-output", onChange: createAudioChangeHandler(availableSpeakers, changeIODevice, Calling_1.CallingDeviceType.SPEAKER), value: selectedSpeakerIndex }, renderAudioOptions(availableSpeakers, i18n, selectedSpeaker)))));
    };
});