require(exports => {
    "use strict";
    var __importDefault = (this && this.__importDefault) || function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    const Sound_1 = require("./Sound");
    const p_queue_1 = __importDefault(require("p-queue"));
    const ringtoneEventQueue = new p_queue_1.default({ concurrency: 1 });
    class CallingTones {
        async playEndCall() {
            const canPlayTone = await window.getCallRingtoneNotification();
            if (!canPlayTone) {
                return;
            }
            const tone = new Sound_1.Sound({
                src: 'sounds/navigation-cancel.ogg',
            });
            await tone.play();
        }
        async playRingtone() {
            await ringtoneEventQueue.add(async () => {
                if (this.ringtone) {
                    this.ringtone.stop();
                    this.ringtone = undefined;
                }
                const canPlayTone = await window.getCallRingtoneNotification();
                if (!canPlayTone) {
                    return;
                }
                this.ringtone = new Sound_1.Sound({
                    loop: true,
                    src: 'sounds/ringtone_minimal.ogg',
                });
                await this.ringtone.play();
            });
        }
        async stopRingtone() {
            await ringtoneEventQueue.add(async () => {
                if (this.ringtone) {
                    this.ringtone.stop();
                    this.ringtone = undefined;
                }
            });
        }
    }
    exports.callingTones = new CallingTones();
});