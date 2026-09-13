import { soundMaster } from './sound_master.js';

class DiceSFX {
    playTick() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(output);

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    }

    playResult() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'square';
                osc.frequency.setValueAtTime(200 + Math.random() * 300, ctx.currentTime);

                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

                osc.connect(gain);
                gain.connect(output);

                osc.start();
                osc.stop(ctx.currentTime + 0.04);
            }, i * 70);
        }
    }
}

export const sfxDice = new DiceSFX();