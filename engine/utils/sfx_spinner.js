import { soundMaster } from './sound_master.js';

class SpinnerSFX {
    playTick() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.02);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

        osc.connect(gain);
        gain.connect(output);

        osc.start();
        osc.stop(ctx.currentTime + 0.02);
    }

    playResult() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);

                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

                osc.connect(gain);
                gain.connect(output);

                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }, idx * 90);
        });
    }

    playSpecial() {
        const ctx = soundMaster.getContext();
        const output = soundMaster.getOutputNode();

        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.12);

                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

                osc.connect(gain);
                gain.connect(output);

                osc.start();
                osc.stop(ctx.currentTime + 0.12);

                setTimeout(() => {
                    const boomOsc = ctx.createOscillator();
                    const boomGain = ctx.createGain();

                    boomOsc.type = 'triangle';
                    boomOsc.frequency.setValueAtTime(100, ctx.currentTime);
                    boomOsc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.35);

                    boomGain.gain.setValueAtTime(0.25, ctx.currentTime);
                    boomGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

                    boomOsc.connect(boomGain);
                    boomGain.connect(output);

                    boomOsc.start();
                    boomOsc.stop(ctx.currentTime + 0.35);
                }, 120);

            }, i * 280);
        }
    }
}

export const sfxSpinner = new SpinnerSFX();