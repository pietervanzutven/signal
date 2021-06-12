require(exports => {
    "use strict";
    // Copyright 2020 Signal Messenger, LLC
    // SPDX-License-Identifier: AGPL-3.0-only
    Object.defineProperty(exports, "__esModule", { value: true });
    const lodash_1 = require("lodash");
    // Idle timer - you're active for ACTIVE_TIMEOUT after one of these events
    const ACTIVE_TIMEOUT = 15 * 1000;
    const LISTENER_THROTTLE_TIME = 5 * 1000;
    const ACTIVE_EVENTS = [
        'click',
        'keydown',
        'mousedown',
        'mousemove',
        // 'scroll', // this is triggered by Timeline re-renders, can't use
        'touchstart',
        'wheel',
    ];
    class ActiveWindowService {
        constructor() {
            // This starting value might be wrong but we should get an update from the main process
            //  soon. We'd rather report that the window is inactive so we can show notifications.
            this.isInitialized = false;
            this.isFocused = false;
            this.activeCallbacks = [];
            this.lastActiveEventAt = -Infinity;
            this.callActiveCallbacks = lodash_1.throttle(() => {
                this.activeCallbacks.forEach(callback => callback());
            }, LISTENER_THROTTLE_TIME);
        }
        // These types aren't perfectly accurate, but they make this class easier to test.
        initialize(document, ipc) {
            if (this.isInitialized) {
                throw new Error('Active window service should not be initialized multiple times');
            }
            this.isInitialized = true;
            this.lastActiveEventAt = Date.now();
            const onActiveEvent = this.onActiveEvent.bind(this);
            ACTIVE_EVENTS.forEach((eventName) => {
                document.addEventListener(eventName, onActiveEvent, true);
            });
            // We don't know for sure that we'll get the right data over IPC so we use `unknown`.
            ipc.on('set-window-focus', (_event, isFocused) => {
                this.setWindowFocus(Boolean(isFocused));
            });
        }
        isActive() {
            return (this.isFocused && Date.now() < this.lastActiveEventAt + ACTIVE_TIMEOUT);
        }
        registerForActive(callback) {
            this.activeCallbacks.push(callback);
        }
        unregisterForActive(callback) {
            this.activeCallbacks = this.activeCallbacks.filter(item => item !== callback);
        }
        onActiveEvent() {
            this.updateState(() => {
                this.lastActiveEventAt = Date.now();
            });
        }
        setWindowFocus(isFocused) {
            this.updateState(() => {
                this.isFocused = isFocused;
            });
        }
        updateState(fn) {
            const wasActiveBefore = this.isActive();
            fn();
            const isActiveNow = this.isActive();
            if (!wasActiveBefore && isActiveNow) {
                this.callActiveCallbacks();
            }
        }
    }
    exports.ActiveWindowService = ActiveWindowService;
});