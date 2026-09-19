/* ==========================================================================
   MODULE: PASSWORD GENERATOR
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class PasswordGeneratorModule {
    constructor() {
        this.container = null;
        this.charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
        };
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Password Generator</h2>
                <p class="module-desc">Tạo mật khẩu ngẫu nhiên, an toàn và tùy chỉnh theo nhu cầu bảo mật.</p>

                <!-- DISPLAY RESULT -->
                <div class="pass-display-box" style="
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 12px;
                ">
                    <div id="pass-result" style="
                        font-family: monospace;
                        font-size: 1.4rem;
                        letter-spacing: 2px;
                        color: #10b981;
                        word-break: break-all;
                    ">
                        - - - - - - - -
                    </div>
                    <button id="btn-copy-pass" class="btn-secondary" style="
                        padding: 10px 16px;
                        background: rgba(255,255,255,0.08);
                        border: 1px solid rgba(255,255,255,0.15);
                        color: #fff;
                        border-radius: 8px;
                        cursor: pointer;
                        white-space: nowrap;
                    ">
                        📋 Copy
                    </button>
                </div>

                <!-- STRENGTH METER -->
                <div style="margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.85em; color: var(--text-muted, #aaa);">
                        <span>Độ mạnh mật khẩu:</span>
                        <span id="pass-strength-label" style="font-weight: 600; color: #ef4444;">Yếu</span>
                    </div>
                    <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                        <div id="pass-strength-bar" style="height: 100%; width: 25%; background: #ef4444; transition: all 0.3s ease;"></div>
                    </div>
                </div>

                <!-- CONTROLS -->
                <div class="pass-controls" style="display: flex; flex-direction: column; gap: 16px;">
                    <!-- LENGTH SLIDER -->
                    <div class="form-group" style="margin: 0;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <label style="color: var(--text-muted, #aaa); font-size: 0.9em;">Độ dài mật khẩu:</label>
                            <span id="pass-length-val" style="font-weight: bold; color: #10b981;">16</span>
                        </div>
                        <input type="range" id="pass-length" min="6" max="64" value="16" style="width: 100%; cursor: pointer;">
                    </div>

                    <!-- CHECKBOX OPTIONS -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px;">
                        <label style="display: flex; align-items: center; gap: 8px; color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">
                            <input type="checkbox" id="chk-uppercase" checked> Chữ hoa (A-Z)
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">
                            <input type="checkbox" id="chk-lowercase" checked> Chữ thường (a-z)
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">
                            <input type="checkbox" id="chk-numbers" checked> Chữ số (0-9)
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">
                            <input type="checkbox" id="chk-symbols" checked> Ký tự đặc biệt (!@#$)
                        </label>
                    </div>

                    <button id="btn-gen-pass" class="btn-primary" style="padding: 12px; margin-top: 12px; font-size: 1rem;">🔑 Tạo Mật Khẩu</button>
                </div>
            </div>
        `;

        this.bindEvents();
        this.generatePassword();
    }

    bindEvents() {
        const slider = this.container.querySelector('#pass-length');
        const lengthVal = this.container.querySelector('#pass-length-val');
        const btnGen = this.container.querySelector('#btn-gen-pass');
        const btnCopy = this.container.querySelector('#btn-copy-pass');

        slider?.addEventListener('input', (e) => {
            if (lengthVal) lengthVal.textContent = e.target.value;
            this.generatePassword();
        });

        this.container.querySelectorAll('input[type="checkbox"]').forEach(chk => {
            chk.addEventListener('change', () => this.generatePassword());
        });

        btnGen?.addEventListener('click', () => this.generatePassword());

        btnCopy?.addEventListener('click', () => {
            const passText = this.container.querySelector('#pass-result').textContent.trim();
            if (!passText || passText === '- - - - - - - -') return;

            navigator.clipboard.writeText(passText);
            btnCopy.textContent = '✅ Đã Copy!';
            setTimeout(() => btnCopy.textContent = '📋 Copy', 1200);
        });
    }

    generatePassword() {
        const length = parseInt(this.container.querySelector('#pass-length').value) || 16;
        const useUpper = this.container.querySelector('#chk-uppercase').checked;
        const useLower = this.container.querySelector('#chk-lowercase').checked;
        const useNum = this.container.querySelector('#chk-numbers').checked;
        const useSym = this.container.querySelector('#chk-symbols').checked;

        let availableChars = '';
        if (useUpper) availableChars += this.charSets.uppercase;
        if (useLower) availableChars += this.charSets.lowercase;
        if (useNum) availableChars += this.charSets.numbers;
        if (useSym) availableChars += this.charSets.symbols;

        const resultEl = this.container.querySelector('#pass-result');

        if (!availableChars) {
            if (resultEl) resultEl.textContent = 'Vui lòng chọn ít nhất 1 ký tự!';
            this.updateStrength(0);
            return;
        }

        // Dùng Crypto API để tạo số ngẫu nhiên an toàn (Cryptographically secure)
        let password = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            password += availableChars[array[i] % availableChars.length];
        }

        if (resultEl) resultEl.textContent = password;

        this.updateStrength(length, [useUpper, useLower, useNum, useSym].filter(Boolean).length);
        this.playSuccessSFX();

        // Lưu log (ẩn mật khẩu vì lý do bảo mật)
        historyManager.addLog('Password Generator', `Tạo mật khẩu ${length} ký tự`);
    }

    updateStrength(length, typeCount) {
        const label = this.container.querySelector('#pass-strength-label');
        const bar = this.container.querySelector('#pass-strength-bar');

        if (!label || !bar) return;

        let score = 0;
        if (length >= 8) score += 1;
        if (length >= 12) score += 1;
        if (length >= 16) score += 1;
        if (typeCount >= 3) score += 1;
        if (typeCount === 4 && length >= 12) score += 1;

        if (score <= 1) {
            label.textContent = 'Rất Yếu';
            label.style.color = '#ef4444';
            bar.style.width = '20%';
            bar.style.background = '#ef4444';
        } else if (score === 2) {
            label.textContent = 'Yếu';
            label.style.color = '#f97316';
            bar.style.width = '40%';
            bar.style.background = '#f97316';
        } else if (score === 3) {
            label.textContent = 'Trung Bình';
            label.style.color = '#eab308';
            bar.style.width = '60%';
            bar.style.background = '#eab308';
        } else if (score === 4) {
            label.textContent = 'Mạnh';
            label.style.color = '#3b82f6';
            bar.style.width = '80%';
            bar.style.background = '#3b82f6';
        } else {
            label.textContent = 'Cực Kỳ An Toàn';
            label.style.color = '#10b981';
            bar.style.width = '100%';
            bar.style.background = '#10b981';
        }
    }

    playSuccessSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);

            gain.gain.setValueAtTime(0.06, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) {
            console.warn(e);
        }
    }
}