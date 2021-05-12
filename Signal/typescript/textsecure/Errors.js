(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.Errors = {};

    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable max-classes-per-file */
    Object.defineProperty(exports, "__esModule", { value: true });
    function appendStack(newError, originalError) {
        // eslint-disable-next-line no-param-reassign
        newError.stack += `\nOriginal stack:\n${originalError.stack}`;
    }
    class ReplayableError extends Error {
        constructor(options) {
            super(options.message);
            this.name = options.name || 'ReplayableError';
            this.message = options.message;
            // Maintains proper stack trace, where our error was thrown (only available on V8)
            //   via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this);
            }
            this.functionCode = options.functionCode;
        }
    }
    exports.ReplayableError = ReplayableError;
    class IncomingIdentityKeyError extends ReplayableError {
        // Note: Data to resend message is no longer captured
        constructor(incomingIdentifier, _m, key) {
            const identifer = incomingIdentifier.split('.')[0];
            super({
                name: 'IncomingIdentityKeyError',
                message: `The identity of ${identifer} has changed.`,
            });
            this.identifier = identifer;
            this.identityKey = key;
        }
    }
    exports.IncomingIdentityKeyError = IncomingIdentityKeyError;
    class OutgoingIdentityKeyError extends ReplayableError {
        // Note: Data to resend message is no longer captured
        constructor(incomingIdentifier, _m, _t, identityKey) {
            const identifier = incomingIdentifier.split('.')[0];
            super({
                name: 'OutgoingIdentityKeyError',
                message: `The identity of ${identifier} has changed.`,
            });
            this.identifier = identifier;
            this.identityKey = identityKey;
        }
    }
    exports.OutgoingIdentityKeyError = OutgoingIdentityKeyError;
    class OutgoingMessageError extends ReplayableError {
        // Note: Data to resend message is no longer captured
        constructor(incomingIdentifier, _m, _t, httpError) {
            const identifier = incomingIdentifier.split('.')[0];
            super({
                name: 'OutgoingMessageError',
                message: httpError ? httpError.message : 'no http error',
            });
            this.identifier = identifier;
            if (httpError) {
                this.code = httpError.code;
                appendStack(this, httpError);
            }
        }
    }
    exports.OutgoingMessageError = OutgoingMessageError;
    class SendMessageNetworkError extends ReplayableError {
        constructor(identifier, _m, httpError) {
            super({
                name: 'SendMessageNetworkError',
                message: httpError.message,
            });
            [this.identifier] = identifier.split('.');
            this.code = httpError.code;
            appendStack(this, httpError);
        }
    }
    exports.SendMessageNetworkError = SendMessageNetworkError;
    class SignedPreKeyRotationError extends ReplayableError {
        constructor() {
            super({
                name: 'SignedPreKeyRotationError',
                message: 'Too many signed prekey rotation failures',
            });
        }
    }
    exports.SignedPreKeyRotationError = SignedPreKeyRotationError;
    class MessageError extends ReplayableError {
        constructor(_m, httpError) {
            super({
                name: 'MessageError',
                message: httpError.message,
            });
            this.code = httpError.code;
            appendStack(this, httpError);
        }
    }
    exports.MessageError = MessageError;
    class UnregisteredUserError extends Error {
        constructor(identifier, httpError) {
            const { message } = httpError;
            super(message);
            this.message = message;
            this.name = 'UnregisteredUserError';
            // Maintains proper stack trace, where our error was thrown (only available on V8)
            //   via https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
            if (Error.captureStackTrace) {
                Error.captureStackTrace(this);
            }
            this.identifier = identifier;
            this.code = httpError.code;
            appendStack(this, httpError);
        }
    }
    exports.UnregisteredUserError = UnregisteredUserError;
})();