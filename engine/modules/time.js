/* ==========================================================================
   MODULE: TIME INFO & TOOLS
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class TimeInfoModule {
    constructor() {
        this.container = null;
        this.timer = null;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Time Info</h2>
                <p class="module-desc">Real-time clock, world time zones, and a random timestamp generator.</p>

                <!-- REALTIME CLOCK BANNER -->
                <div style="
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 12px;
                    padding: 24px;
                    text-align: center;
                    margin: 20px 0;
                ">
                    <div id="realtime-clock" style="font-size: 2.8rem; font-weight: 700; font-family: monospace; color: #10b981; letter-spacing: 2px;">
                        00:00:00
                    </div>
                    <div id="realtime-date" style="font-size: 1rem; color: #94a3b8; margin-top: 6px;">
                        Loading time...
                    </div>
                </div>

                <!-- WORLD CLOCKS & TIMESTAMP GENERATOR -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <!-- WORLD CLOCK -->
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px;">
                        <h3 style="font-size: 1rem; color: #f8fafc; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            🌍 World Clock
                        </h3>
                        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9em;">
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #94a3b8;">Tokyo (JST):</span>
                                <span id="clock-tokyo" style="font-family: monospace; color: #f8fafc;">--:--</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #94a3b8;">London (BST/GMT):</span>
                                <span id="clock-london" style="font-family: monospace; color: #f8fafc;">--:--</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span style="color: #94a3b8;">New York (EDT):</span>
                                <span id="clock-ny" style="font-family: monospace; color: #f8fafc;">--:--</span>
                            </div>
                        </div>
                    </div>

                    <!-- RANDOM TIMESTAMP TOOL -->
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
                        <div>
                            <h3 style="font-size: 1rem; color: #f8fafc; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                                🎲 Random Timestamp
                            </h3>
                            <p style="font-size: 0.8em; color: #94a3b8; margin-bottom: 12px;">Generate a random time point (Unix Epoch).</p>
                        </div>

                        <div id="timestamp-result" style="font-family: monospace; font-size: 1.1rem; color: #3b82f6; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 6px; text-align: center; margin-bottom: 12px;">
                            ----------
                        </div>

                        <button id="btn-gen-timestamp" class="btn-primary" style="padding: 8px 14px; font-size: 0.85em;">⚡ Generate Random Timestamp</button>
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.startClock();
    }

    bindEvents() {
        const btnGen = this.container.querySelector('#btn-gen-timestamp');
        btnGen?.addEventListener('click', () => this.generateRandomTimestamp());
    }

    startClock() {
        if (this.timer) clearInterval(this.timer);

        const update = () => {
            const now = new Date();
            
            // Local Clock
            const clockEl = this.container?.querySelector('#realtime-clock');
            const dateEl = this.container?.querySelector('#realtime-date');

            if (clockEl) clockEl.textContent = now.toLocaleTimeString('vi-VN');
            if (dateEl) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateEl.textContent = now.toLocaleDateString('vi-VN', options);
            }

            // World Clocks
            const tokyoEl = this.container?.querySelector('#clock-tokyo');
            const londonEl = this.container?.querySelector('#clock-london');
            const nyEl = this.container?.querySelector('#clock-ny');

            if (tokyoEl) tokyoEl.textContent = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo' });
            if (londonEl) londonEl.textContent = now.toLocaleTimeString('en-US', { timeZone: 'Europe/London' });
            if (nyEl) nyEl.textContent = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York' });
        };

        update();
        this.timer = setInterval(update, 1000);
    }

    generateRandomTimestamp() {
        // Random from the year 2000 to 2030
        const start = new Date(2000, 0, 1).getTime();
        const end = new Date(2030, 11, 31).getTime();
        const randomTime = Math.floor(start + Math.random() * (end - start));
        const timestamp = Math.floor(randomTime / 1000);

        const resEl = this.container.querySelector('#timestamp-result');
        const readableDate = new Date(randomTime).toLocaleDateString('vi-VN');

        if (resEl) {
            resEl.textContent = `${timestamp} (${readableDate})`;
        }

        this.playClickSFX();
        historyManager.addLog('Time Info', `Random Timestamp: ${timestamp}`);
    }

    playClickSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(900, ctx.currentTime);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } catch (e) { console.warn(e); }
    }
}