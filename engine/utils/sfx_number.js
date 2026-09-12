/* ==========================================================================
   SFX ENGINE: NUMBER GENERATOR
   ========================================================================== */

import { soundMaster } from './sound_master.js';

class NumberSFX {
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
        const masterVol = soundMaster.getVolume();
        if (masterVol === 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.15 * masterVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01 * masterVol, this.ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.03);
    }

    playSuccess() {
        this.init();
        const masterVol = soundMaster.getVolume();
        if (masterVol === 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.25 * masterVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001 * masterVol, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
}

export const sfxNumber = new NumberSFX();