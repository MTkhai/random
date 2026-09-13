/* ==========================================================================
   SOUND MASTER: CENTRAL AUDIO NODE
   ========================================================================== */

class SoundMaster {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.volume = parseFloat(localStorage.getItem('master_volume')) ?? 1.0;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
    }

    // Đổi trực tiếp biên độ của Master Node - Tất cả SFX sẽ thay đổi volume tức thì!
    setVolume(val) {
        this.volume = Math.max(0, Math.min(1, parseFloat(val)));
        localStorage.setItem('master_volume', this.volume);
        
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    getVolume() {
        return this.volume;
    }

    // Hàm trả về Master Node để các module SFX cắm dây âm thanh vào
    getOutputNode() {
        this.init();
        return this.masterGain;
    }

    getContext() {
        this.init();
        return this.ctx;
    }
}

export const soundMaster = new SoundMaster();