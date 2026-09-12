/* ==========================================================================
   SFX ENGINE: DICE & COIN
   ========================================================================== */

import { soundMaster } from './sound_master.js';

class DiceSFX {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playCoinFlip() {
        this.init();
        const masterVol = soundMaster.getVolume();
        if (masterVol === 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2400, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2 * masterVol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001 * masterVol, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playDiceRoll() {
        this.init();
        const masterVol = soundMaster.getVolume();
        if (masterVol === 0) return;

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(200 + Math.random() * 300, this.ctx.currentTime);

                gain.gain.setValueAtTime(0.1 * masterVol, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01 * masterVol, this.ctx.currentTime + 0.04);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 0.04);
            }, i * 70);
        }
    }
}

export const sfxDice = new DiceSFX();