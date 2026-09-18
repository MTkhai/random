/* ==========================================================================
   MODULE: COLOR PALETTE GENERATOR
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class ColorPaletteModule {
    constructor() {
        this.container = null;
        this.paletteSize = 5;
        this.colors = []; // [{ hex: '#ff0000', locked: false }, ...]
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Color Palette Generator</h2>
                <p class="module-desc">Tạo phối màu hài hòa ngẫu nhiên. Bấm 🔓 để khóa màu yêu thích, bấm vào mã màu để Copy.</p>
                
                <div class="palette-toolbar" style="display: flex; gap: 12px; margin: 20px 0; align-items: center; flex-wrap: wrap;">
                    <div class="form-group" style="margin: 0;">
                        <select id="palette-mode" class="form-input" style="padding: 8px 12px;">
                            <option value="random">Ngẫu nhiên tự do (Random)</option>
                            <option value="analogous">Tương đồng (Analogous)</option>
                            <option value="monochromatic">Đơn sắc (Monochromatic)</option>
                            <option value="complementary">Bổ túc trực tiếp (Complementary)</option>
                            <option value="triadic">Bổ túc tam giác (Triadic)</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        <label style="color: var(--text-muted, #aaa); font-size: 0.9em;">Số màu:</label>
                        <select id="palette-count" class="form-input" style="padding: 8px;">
                            <option value="4">4 màu</option>
                            <option value="5" selected>5 màu</option>
                            <option value="6">6 màu</option>
                        </select>
                    </div>

                    <button id="btn-gen-palette" class="btn-primary" style="margin-left: auto;">🎨 Tạo Bảng Màu Baru (Space)</button>
                </div>

                <!-- ĐÃ SỬA: Đổi grid sang flex để không bị nhảy dòng -->
                <div id="palette-cards-container" style="display: flex; gap: 12px; height: 360px; margin-top: 15px; width: 100%;">
                </div>
            </div>
        `;

        this.initDefaultColors();
        this.bindEvents();
        this.renderCards();
    }

    bindEvents() {
        const btnGen = this.container.querySelector('#btn-gen-palette');
        const countSelect = this.container.querySelector('#palette-count');

        btnGen?.addEventListener('click', () => this.generatePalette());

        countSelect?.addEventListener('change', (e) => {
            this.paletteSize = parseInt(e.target.value) || 5;
            this.adjustColorsSize();
            this.renderCards();
        });

        window.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handleKeyDown(e) {
        if (e.code === 'Space' && document.body.contains(this.container) && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            this.generatePalette();
        }
    }

    initDefaultColors() {
        this.colors = [];
        for (let i = 0; i < this.paletteSize; i++) {
            this.colors.push({ hex: this.getRandomHex(), locked: false });
        }
    }

    adjustColorsSize() {
        while (this.colors.length < this.paletteSize) {
            this.colors.push({ hex: this.getRandomHex(), locked: false });
        }
        if (this.colors.length > this.paletteSize) {
            this.colors = this.colors.slice(0, this.paletteSize);
        }
    }

    getRandomHex() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }

    hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    generatePalette() {
        const mode = this.container.querySelector('#palette-mode').value;
        const baseHue = Math.floor(Math.random() * 360);

        this.colors.forEach((col, idx) => {
            if (col.locked) return;

            let hex = '';
            if (mode === 'random') {
                hex = this.getRandomHex();
            } else if (mode === 'analogous') {
                const hue = (baseHue + (idx * 25)) % 360;
                hex = this.hslToHex(hue, 65 + (Math.random() * 20), 50 + (Math.random() * 15));
            } else if (mode === 'complementary') {
                const hue = (idx % 2 === 0) ? baseHue : (baseHue + 180) % 360;
                hex = this.hslToHex(hue, 70, 40 + (Math.random() * 30));
            } else if (mode === 'triadic') {
                const shift = (idx % 3) * 120;
                const hue = (baseHue + shift) % 360;
                hex = this.hslToHex(hue, 75, 45 + (Math.random() * 20));
            } else if (mode === 'monochromatic') {
                const lightness = 20 + (idx * (60 / this.paletteSize)) + (Math.random() * 10);
                hex = this.hslToHex(0, 0, lightness);
            }

            col.hex = hex;
        });

        this.renderCards();
        this.playGenerateSFX();

        const summary = this.colors.map(c => c.hex.toUpperCase()).join(', ');
        historyManager.addLog('Color Palette', summary);
    }

    renderCards() {
        const grid = this.container.querySelector('#palette-cards-container');
        if (!grid) return;
        grid.innerHTML = '';

        this.colors.forEach((col) => {
            const card = document.createElement('div');
            card.className = 'color-card';
            
            // ĐÃ SỬA: Thêm flex: 1 và min-width: 0 để 6 màu ép vừa đúng 1 hàng
            card.style.cssText = `
                flex: 1;
                min-width: 0;
                background-color: ${col.hex};
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 16px;
                transition: all 0.2s ease;
                position: relative;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;

            const isDark = this.isDarkColor(col.hex);
            const textColor = isDark ? '#ffffff' : '#0f172a';

            card.innerHTML = `
                <button class="btn-lock" style="
                    align-self: flex-end; 
                    background: rgba(0,0,0,0.2); 
                    border: none; 
                    color: ${textColor}; 
                    border-radius: 50%; 
                    width: 36px; 
                    height: 36px; 
                    cursor: pointer;
                    font-size: 1.1em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">${col.locked ? '🔒' : '🔓'}</button>

                <div style="text-align: center; margin-top: 60px;">
                    <div class="hex-text" style="
                        font-weight: bold; 
                        font-size: 1em; 
                        color: ${textColor}; 
                        letter-spacing: 0.5px;
                        cursor: pointer;
                        padding: 6px 8px;
                        border-radius: 6px;
                        background: rgba(0,0,0,0.15);
                        backdrop-filter: blur(4px);
                        white-space: nowrap;
                    ">${col.hex.toUpperCase()}</div>
                    <div style="font-size: 0.75em; color: ${textColor}; opacity: 0.8; margin-top: 4px;">Bấm để Copy</div>
                </div>
            `;

            card.querySelector('.btn-lock').addEventListener('click', (e) => {
                e.stopPropagation();
                col.locked = !col.locked;
                this.renderCards();
            });

            card.querySelector('.hex-text').addEventListener('click', () => {
                navigator.clipboard.writeText(col.hex.toUpperCase());
                this.playCopySFX();
                
                const hexEl = card.querySelector('.hex-text');
                const oldText = hexEl.textContent;
                hexEl.textContent = 'COPIED!';
                setTimeout(() => hexEl.textContent = oldText, 1000);
            });

            grid.appendChild(card);
        });
    }

    isDarkColor(hex) {
        const c = hex.replace('#', '');
        const rgb = parseInt(c, 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        return luma < 128;
    }

    playGenerateSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) { console.warn(e); }
    }

    playCopySFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(900, ctx.currentTime);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (e) { console.warn(e); }
    }
}