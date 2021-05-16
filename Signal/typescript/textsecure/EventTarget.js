(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.EventTarget = {};

    /* eslint-disable @typescript-eslint/explicit-module-boundary-types */
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable guard-for-in */
    /* eslint-disable no-restricted-syntax */
    /* eslint-disable @typescript-eslint/ban-types */
    Object.defineProperty(exports, "__esModule", { value: true });
    /*
     * Implements EventTarget
     * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
     */
    class EventTarget {
        dispatchEvent(ev) {
            if (!(ev instanceof Event)) {
                throw new Error('Expects an event');
            }
            if (this.listeners === null || typeof this.listeners !== 'object') {
                this.listeners = {};
            }
            const listeners = this.listeners[ev.type];
            const results = [];
            if (typeof listeners === 'object') {
                const max = listeners.length;
                for (let i = 0; i < max; i += 1) {
                    const listener = listeners[i];
                    if (typeof listener === 'function') {
                        results.push(listener.call(null, ev));
                    }
                }
            }
            return results;
        }
        addEventListener(eventName, callback) {
            if (typeof eventName !== 'string') {
                throw new Error('First argument expects a string');
            }
            if (typeof callback !== 'function') {
                throw new Error('Second argument expects a function');
            }
            if (this.listeners === null || typeof this.listeners !== 'object') {
                this.listeners = {};
            }
            let listeners = this.listeners[eventName];
            if (typeof listeners !== 'object') {
                listeners = [];
            }
            listeners.push(callback);
            this.listeners[eventName] = listeners;
        }
        removeEventListener(eventName, callback) {
            if (typeof eventName !== 'string') {
                throw new Error('First argument expects a string');
            }
            if (typeof callback !== 'function') {
                throw new Error('Second argument expects a function');
            }
            if (this.listeners === null || typeof this.listeners !== 'object') {
                this.listeners = {};
            }
            const listeners = this.listeners[eventName];
            if (typeof listeners === 'object') {
                for (let i = 0; i < listeners.length; i += 1) {
                    if (listeners[i] === callback) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
            this.listeners[eventName] = listeners;
        }
        extend(source) {
            const target = this;
            for (const prop in source) {
                target[prop] = source[prop];
            }
            return target;
        }
    }
    exports.default = EventTarget;
})();