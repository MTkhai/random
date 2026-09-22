/* ==========================================================================
   SOUND MASTER: CENTRAL AUDIO NODE (FIXED)
   ========================================================================== */

class SoundMaster {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        
        // Parse an toàn, nếu dính NaN hoặc null thì fallback về 1.0
        const savedVol = parseFloat(localStorage.getItem('master_volume'));
        this.volume = Number.isFinite(savedVol) ? Math.max(0, Math.min(1, savedVol)) : 1.0;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            
            // Đảm bảo volume truyền vào setValueAtTime luôn là số thực hợp lệ
            const validVol = Number.isFinite(this.volume) ? this.volume : 1.0;
            this.masterGain.gain.setValueAtTime(validVol, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
    }

    setVolume(val) {
        const parsed = parseFloat(val);
        this.volume = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 1.0;
        localStorage.setItem('master_volume', this.volume);
        
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }

    getVolume() {
        return this.volume;
    }

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