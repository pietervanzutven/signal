require(exports => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Sound_1 = require("./Sound");
    async function playSound(howlProps) {
        const canPlayTone = await window.getCallRingtoneNotification();
        if (!canPlayTone) {
            return;
        }
        const tone = new Sound_1.Sound(howlProps);
        await tone.play();
        return tone;
    }
    class CallingTones {
        async playEndCall() {
            await playSound({
                src: 'sounds/navigation-cancel.ogg',
            });
        }
        async playRingtone() {
            if (this.ringtone) {
                this.stopRingtone();
            }
            this.ringtone = await playSound({
                loop: true,
                src: 'sounds/ringtone_minimal.ogg',
            });
        }
        stopRingtone() {
            if (this.ringtone) {
                this.ringtone.stop();
                this.ringtone = undefined;
            }
        }
    }
    exports.callingTones = new CallingTones();
});