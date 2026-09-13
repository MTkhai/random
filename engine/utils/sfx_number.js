import { soundMaster } from './sound_master.js';

class NumberSFX {
    playTick() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(output); // <- Cắm thẳng vào Master Gain

        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    }

    playResult() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(output);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    }
}

export const sfxNumber = new NumberSFX();