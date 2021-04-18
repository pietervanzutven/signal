(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.services = window.ts.services || {};
    const exports = window.ts.services.networkObserver = {};

    Object.defineProperty(exports, "__esModule", { value: true });
    const socketStatus_1 = window.ts.shims.socketStatus;
    const REFRESH_INTERVAL = 5000;
    function initializeNetworkObserver(networkActions) {
        const { log } = window;
        log.info(`Initializing network observer every ${REFRESH_INTERVAL}ms`);
        const refresh = () => {
            networkActions.checkNetworkStatus({
                isOnline: navigator.onLine,
                socketStatus: socketStatus_1.getSocketStatus(),
            });
        };
        window.addEventListener('online', refresh);
        window.addEventListener('offline', refresh);
        window.setInterval(refresh, REFRESH_INTERVAL);
        window.setTimeout(() => {
            networkActions.closeConnectingGracePeriod();
        }, REFRESH_INTERVAL);
    }
    exports.initializeNetworkObserver = initializeNetworkObserver;
})();