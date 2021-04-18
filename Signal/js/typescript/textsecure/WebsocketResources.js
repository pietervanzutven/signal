(function () {
    "use strict";

    window.ts = window.ts || {};
    window.ts.textsecure = window.ts.textsecure || {};
    const exports = window.ts.textsecure.WebsocketResources = {};

    /*
     * WebSocket-Resources
     *
     * Create a request-response interface over websockets using the
     * WebSocket-Resources sub-protocol[1].
     *
     * var client = new WebSocketResource(socket, function(request) {
     *    request.respond(200, 'OK');
     * });
     *
     * client.sendRequest({
     *    verb: 'PUT',
     *    path: '/v1/messages',
     *    body: '{ some: "json" }',
     *    success: function(message, status, request) {...},
     *    error: function(message, status, request) {...}
     * });
     *
     * 1. https://github.com/signalapp/WebSocket-Resources
     *
     */
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const EventTarget_1 = __importDefault(window.ts.textsecure.EventTarget);
    class Request {
        constructor(options) {
            this.verb = options.verb || options.type;
            this.path = options.path || options.url;
            this.headers = options.headers;
            this.body = options.body || options.data;
            this.success = options.success;
            this.error = options.error;
            this.id = options.id;
            if (this.id === undefined) {
                const bits = new Uint32Array(2);
                window.crypto.getRandomValues(bits);
                this.id = window.dcodeIO.Long.fromBits(bits[0], bits[1], true);
            }
            if (this.body === undefined) {
                this.body = null;
            }
        }
    }
    class IncomingWebSocketRequest {
        constructor(options) {
            const request = new Request(options);
            const { socket } = options;
            this.verb = request.verb;
            this.path = request.path;
            this.body = request.body;
            this.headers = request.headers;
            this.respond = (status, message) => {
                socket.send(new window.textsecure.protobuf.WebSocketMessage({
                    type: window.textsecure.protobuf.WebSocketMessage.Type.RESPONSE,
                    response: { id: request.id, message, status },
                })
                    .encode()
                    .toArrayBuffer());
            };
        }
    }
    exports.IncomingWebSocketRequest = IncomingWebSocketRequest;
    const outgoing = {};
    class OutgoingWebSocketRequest {
        constructor(options, socket) {
            const request = new Request(options);
            outgoing[request.id] = request;
            socket.send(new window.textsecure.protobuf.WebSocketMessage({
                type: window.textsecure.protobuf.WebSocketMessage.Type.REQUEST,
                request: {
                    verb: request.verb,
                    path: request.path,
                    body: request.body,
                    headers: request.headers,
                    id: request.id,
                },
            })
                .encode()
                .toArrayBuffer());
        }
    }
    class WebSocketResource extends EventTarget_1.default {
        // tslint:disable-next-line max-func-body-length
        constructor(socket, opts = {}) {
            super();
            let { handleRequest } = opts;
            if (typeof handleRequest !== 'function') {
                handleRequest = (request) => {
                    request.respond(404, 'Not found');
                };
            }
            this.sendRequest = options => new OutgoingWebSocketRequest(options, socket);
            // eslint-disable-next-line no-param-reassign
            socket.onmessage = socketMessage => {
                const blob = socketMessage.data;
                const handleArrayBuffer = (buffer) => {
                    const message = window.textsecure.protobuf.WebSocketMessage.decode(buffer);
                    if (message.type ===
                        window.textsecure.protobuf.WebSocketMessage.Type.REQUEST &&
                        message.request) {
                        handleRequest(new IncomingWebSocketRequest({
                            verb: message.request.verb,
                            path: message.request.path,
                            body: message.request.body,
                            headers: message.request.headers,
                            id: message.request.id,
                            socket,
                        }));
                    }
                    else if (message.type ===
                        window.textsecure.protobuf.WebSocketMessage.Type.RESPONSE &&
                        message.response) {
                        const { response } = message;
                        const request = outgoing[response.id];
                        if (request) {
                            request.response = response;
                            let callback = request.error;
                            if (response.status &&
                                response.status >= 200 &&
                                response.status < 300) {
                                callback = request.success;
                            }
                            if (typeof callback === 'function') {
                                callback(response.message, response.status, request);
                            }
                        }
                        else {
                            throw new Error(`Received response for unknown request ${message.response.id}`);
                        }
                    }
                };
                if (blob instanceof ArrayBuffer) {
                    handleArrayBuffer(blob);
                }
                else {
                    const reader = new FileReader();
                    reader.onload = () => {
                        handleArrayBuffer(reader.result);
                    };
                    reader.readAsArrayBuffer(blob);
                }
            };
            if (opts.keepalive) {
                this.keepalive = new KeepAlive(this, {
                    path: opts.keepalive.path,
                    disconnect: opts.keepalive.disconnect,
                });
                const resetKeepAliveTimer = this.keepalive.reset.bind(this.keepalive);
                // websocket type definitions don't include an addEventListener, but it's there. And
                //   We can't use declaration merging on classes:
                // https://www.typescriptlang.org/docs/handbook/declaration-merging.html#disallowed-merges)
                // @ts-ignore
                socket.addEventListener('open', resetKeepAliveTimer);
                // @ts-ignore
                socket.addEventListener('message', resetKeepAliveTimer);
                // @ts-ignore
                socket.addEventListener('close', this.keepalive.stop.bind(this.keepalive));
            }
            // @ts-ignore
            socket.addEventListener('close', () => {
                this.closed = true;
            });
            this.close = (code = 3000, reason) => {
                if (this.closed) {
                    return;
                }
                window.log.info('WebSocketResource.close()');
                if (this.keepalive) {
                    this.keepalive.stop();
                }
                socket.close(code, reason);
                // @ts-ignore
                socket.onmessage = null;
                // On linux the socket can wait a long time to emit its close event if we've
                //   lost the internet connection. On the order of minutes. This speeds that
                //   process up.
                setTimeout(() => {
                    if (this.closed) {
                        return;
                    }
                    this.closed = true;
                    window.log.warn('Dispatching our own socket close event');
                    const ev = new Event('close');
                    ev.code = code;
                    ev.reason = reason;
                    this.dispatchEvent(ev);
                }, 5000);
            };
        }
    }
    exports.default = WebSocketResource;
    class KeepAlive {
        constructor(websocketResource, opts = {}) {
            if (websocketResource instanceof WebSocketResource) {
                this.path = opts.path !== undefined ? opts.path : '/';
                this.disconnect = opts.disconnect !== undefined ? opts.disconnect : true;
                this.wsr = websocketResource;
            }
            else {
                throw new TypeError('KeepAlive expected a WebSocketResource');
            }
        }
        stop() {
            clearTimeout(this.keepAliveTimer);
            clearTimeout(this.disconnectTimer);
        }
        reset() {
            clearTimeout(this.keepAliveTimer);
            clearTimeout(this.disconnectTimer);
            this.keepAliveTimer = setTimeout(() => {
                if (this.disconnect) {
                    // automatically disconnect if server doesn't ack
                    this.disconnectTimer = setTimeout(() => {
                        clearTimeout(this.keepAliveTimer);
                        this.wsr.close(3001, 'No response to keepalive request');
                    }, 10000);
                }
                else {
                    this.reset();
                }
                window.log.info('Sending a keepalive message');
                this.wsr.sendRequest({
                    verb: 'GET',
                    path: this.path,
                    success: this.reset.bind(this),
                });
            }, 55000);
        }
    }
})();