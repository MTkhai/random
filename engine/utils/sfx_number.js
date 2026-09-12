/* ==========================================================================
   WEB AUDIO SYNTHESIZER (Tạo âm thanh trực tiếp bằng Code)
   ========================================================================== */
import { soundMaster } from './sound_master.js';
class SoundEffects {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    // Tiếng "Tắc" / "Cạch" nhẹ khi số đang nhảy
    playTick() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    // Tiếng "Ting!" chốt hạ kết quả cực bắt tai
    playSuccess() {
        this.init();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // Nốt C5
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // Nốt E5
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16); // Nốt G5

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }
}
const masterVol = soundMaster.getVolume();
gain.gain.setValueAtTime(0.15 * masterVol, this.ctx.currentTime);
export const sfx = new SoundEffects();