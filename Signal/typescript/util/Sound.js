require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Sound {
        constructor(options) {
            this.context = new AudioContext();
            this.loop = Boolean(options.loop);
            this.src = options.src;
        }
        async play() {
            if (!Sound.sounds.has(this.src)) {
                try {
                    const buffer = await Sound.loadSoundFile(this.src);
                    const decodedBuffer = await this.context.decodeAudioData(buffer);
                    Sound.sounds.set(this.src, decodedBuffer);
                }
                catch (err) {
                    window.log.error(`Sound error: ${err}`);
                    return;
                }
            }
            const soundBuffer = Sound.sounds.get(this.src);
            const soundNode = this.context.createBufferSource();
            soundNode.buffer = soundBuffer;
            const volumeNode = this.context.createGain();
            soundNode.connect(volumeNode);
            volumeNode.connect(this.context.destination);
            soundNode.loop = this.loop;
            soundNode.start(0, 0);
            this.node = soundNode;
        }
        stop() {
            if (this.node) {
                this.node.stop(0);
                this.node = undefined;
            }
        }
        static async loadSoundFile(src) {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.responseType = 'arraybuffer';
            return new Promise((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                        return;
                    }
                    reject(new Error(`Request failed: ${xhr.statusText}`));
                };
                xhr.onerror = () => {
                    reject(new Error(`Request failed, most likely file not found: ${src}`));
                };
                xhr.send();
            });
        }
    }
    exports.Sound = Sound;
    Sound.sounds = new Map();
});