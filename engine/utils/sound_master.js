/* ==========================================================================
   ENGINE: GLOBAL SOUND MASTER
   ========================================================================== */

class SoundMaster {
    constructor() {
        this.volume = parseFloat(localStorage.getItem('rans_sfx_volume') ?? '0.5');
    }

    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, parseFloat(value)));
        localStorage.setItem('rans_sfx_volume', this.volume);
    }

    getVolume() {
        return this.volume;
    }
}

export const soundMaster = new SoundMaster();