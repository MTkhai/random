/* ==========================================================================
   MODULE: TIME INFO & TOOLS (Dynamic World Clock)
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

// Danh sách múi giờ phổ biến trên toàn thế giới
const TIMEZONE_OPTIONS = [
    { label: "UTC (World Coordinated Universal Time)", zone: "UTC" },
    { label: "New York (EDT/EST)", zone: "America/New_York" },
    { label: "Beijing / Shanghai (CST)", zone: "Asia/Shanghai" },
    { label: "London (GMT/BST)", zone: "Europe/London" },
    { label: "Tokyo (JST)", zone: "Asia/Tokyo" },
    { label: "Ho Chi Minh / Hanoi (ICT)", zone: "Asia/Ho_Chi_Minh" },
    { label: "Paris / Berlin (CET)", zone: "Europe/Paris" },
    { label: "Sydney (AEST)", zone: "Australia/Sydney" },
    { label: "Los Angeles (PDT/PST)", zone: "America/Los_Angeles" },
    { label: "Chicago (CDT/CST)", zone: "America/Chicago" },
    { label: "Dubai (GST)", zone: "Asia/Dubai" },
    { label: "Singapore (SGT)", zone: "Asia/Singapore" },
    { label: "Seoul (KST)", zone: "Asia/Seoul" },
    { label: "Bangkok (ICT)", zone: "Asia/Bangkok" },
    { label: "Moscow (MSK)", zone: "Europe/Moscow" },
    { label: "Honolulu (HST)", zone: "Pacific/Honolulu" }
];

// Múi giờ mặc định ban đầu
const DEFAULT_CLOCKS = [
    { id: "clock-ny", label: "New York (EDT/EST)", zone: "America/New_York" },
    { id: "clock-beijing", label: "Beijing (CST)", zone: "Asia/Shanghai" },
    { id: "clock-utc", label: "UTC", zone: "UTC" }
];

export default class TimeInfoModule {
    constructor() {
        this.container = null;
        this.timer = null;
        this.worldClocks = [...DEFAULT_CLOCKS];
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Time Info</h2>
                <p class="module-desc">Real-time clock, customizable world time zones, and a random timestamp generator.</p>

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
                    <!-- WORLD CLOCK PANEL -->
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 1rem; color: #f8fafc; margin: 0; display: flex; align-items: center; gap: 8px;">
                                🌍 World Clock
                            </h3>
                        </div>

                        <!-- ADD TIMEZONE CONTROLS -->
                        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                            <select id="select-timezone" style="
                                flex: 1; 
                                background: #1e293b; 
                                color: #f8fafc; 
                                border: 1px solid rgba(255,255,255,0.15); 
                                border-radius: 6px; 
                                padding: 6px 10px; 
                                font-size: 0.85em;
                                outline: none;
                            ">
                                ${TIMEZONE_OPTIONS.map(opt => `<option value="${opt.zone}">${opt.label}</option>`).join('')}
                            </select>
                            <button id="btn-add-clock" class="btn-primary" style="padding: 6px 12px; font-size: 0.85em; white-space: nowrap;">
                                + Add
                            </button>
                        </div>

                        <!-- DYNAMIC CLOCKS LIST -->
                        <div id="world-clocks-list" style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9em; max-height: 220px; overflow-y: auto; padding-right: 4px;">
                            <!-- Items will be generated dynamically -->
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

        this.renderWorldClocksList();
        this.bindEvents();
        this.startClock();
    }

    renderWorldClocksList() {
        const listContainer = this.container.querySelector('#world-clocks-list');
        if (!listContainer) return;

        if (this.worldClocks.length === 0) {
            listContainer.innerHTML = `<div style="color: #64748b; font-size: 0.85em; text-align: center; padding: 10px;">No timezone selected.</div>`;
            return;
        }

        listContainer.innerHTML = this.worldClocks.map(item => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 6px 10px; border-radius: 6px;">
                <span style="color: #94a3b8; font-size: 0.85em; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 160px;" title="${item.label}">${item.label}:</span>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span id="${item.id}" style="font-family: monospace; color: #f8fafc; font-weight: 600;">--:--</span>
                    <button class="btn-remove-clock" data-id="${item.id}" style="
                        background: transparent; 
                        border: none; 
                        color: #ef4444; 
                        cursor: pointer; 
                        font-size: 0.9em; 
                        padding: 0 4px;
                        line-height: 1;
                    " title="Remove Clock">✕</button>
                </div>
            </div>
        `).join('');

        // Gán sự kiện xóa cho từng button
        listContainer.querySelectorAll('.btn-remove-clock').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToRemove = e.currentTarget.getAttribute('data-id');
                this.removeClock(idToRemove);
            });
        });
    }

    bindEvents() {
        const btnGen = this.container.querySelector('#btn-gen-timestamp');
        btnGen?.addEventListener('click', () => this.generateRandomTimestamp());

        const btnAdd = this.container.querySelector('#btn-add-clock');
        btnAdd?.addEventListener('click', () => this.addSelectedClock());
    }

    addSelectedClock() {
        const selectEl = this.container.querySelector('#select-timezone');
        if (!selectEl) return;

        const zone = selectEl.value;
        const selectedOpt = TIMEZONE_OPTIONS.find(opt => opt.zone === zone);
        if (!selectedOpt) return;

        const isDuplicate = this.worldClocks.some(clock => clock.zone === selectedOpt.zone);
        if (isDuplicate) {
            window.alert(`Timezone already added: ${selectedOpt.label}`);
            return;
        }

        const newId = `clock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.worldClocks.push({
            id: newId,
            label: selectedOpt.label,
            zone: selectedOpt.zone
        });

        this.renderWorldClocksList();
        this.playClickSFX();
        historyManager.addLog('Time Info', `Added World Clock: ${selectedOpt.label}`);
    }

    removeClock(id) {
        this.worldClocks = this.worldClocks.filter(c => c.id !== id);
        this.renderWorldClocksList();
        this.playClickSFX();
    }

    startClock() {
        if (this.timer) clearInterval(this.timer);

        const update = () => {
            const now = new Date();
            
            // Local Clock
            const clockEl = this.container?.querySelector('#realtime-clock');
            const dateEl = this.container?.querySelector('#realtime-date');

            if (clockEl) clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
            if (dateEl) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateEl.textContent = now.toLocaleDateString('en-US', options);
            }

            // Dynamic World Clocks
            this.worldClocks.forEach(item => {
                const clockItemEl = this.container?.querySelector(`#${item.id}`);
                if (clockItemEl) {
                    try {
                        clockItemEl.textContent = now.toLocaleTimeString('en-US', { timeZone: item.zone });
                    } catch (e) {
                        clockItemEl.textContent = 'Invalid Zone';
                    }
                }
            });
        };

        update();
        this.timer = setInterval(update, 1000);
    }

    generateRandomTimestamp() {
        const start = new Date(2000, 0, 1).getTime();
        const end = new Date(2030, 11, 31).getTime();
        const randomTime = Math.floor(start + Math.random() * (end - start));
        const timestamp = Math.floor(randomTime / 1000);

        const resEl = this.container.querySelector('#timestamp-result');
        const readableDate = new Date(randomTime).toLocaleDateString('en-US');

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