require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    async function requestCameraPermissions() {
        if (!(await window.getMediaCameraPermissions())) {
            await window.showCallingPermissionsPopup(true);
            // Check the setting again (from the source of truth).
            return window.getMediaCameraPermissions();
        }
        return true;
    }
    exports.requestCameraPermissions = requestCameraPermissions;
});