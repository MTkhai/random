/* ==========================================================================
   SFX ENGINE: CUSTOM SPINNER
   ========================================================================== */
import { soundMaster } from './sound_master.js';
class SpinnerSFX {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playTick() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.02);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.02);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.02);
    }

    playWin() {
        this.init();
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.3);
            }, idx * 90);
        });
    }

    // Tiếng pháo hoa nổ giòn giã
    playFireworks() {
        this.init();
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                // Tiếng rít vút lên
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.12);

                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.12);

                // Tiếng đùng nổ trầm
                setTimeout(() => {
                    const boomOsc = this.ctx.createOscillator();
                    const boomGain = this.ctx.createGain();
                    boomOsc.type = 'triangle';
                    boomOsc.frequency.setValueAtTime(100, this.ctx.currentTime);
                    boomOsc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.35);

                    boomGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
                    boomGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

                    boomOsc.connect(boomGain);
                    boomGain.connect(this.ctx.destination);
                    boomOsc.start();
                    boomOsc.stop(this.ctx.currentTime + 0.35);
                }, 120);

            }, i * 280);
        }
    }
}
const masterVol = soundMaster.getVolume();
gain.gain.setValueAtTime(0.15 * masterVol, this.ctx.currentTime);
export const sfxSpinner = new SpinnerSFX();