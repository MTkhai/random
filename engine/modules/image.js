/* ==========================================================================
   MODULE: IMAGE PLACEHOLDER (LOREM PICSUM API)
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class ImagePlaceholderModule {
    constructor() {
        this.container = null;
        this.currentUrl = '';
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Image Placeholder</h2>
                <p class="module-desc">Generate random placeholder images with custom sizes using the Lorem Picsum API.</p>

                <div class="img-workspace" style="display: grid; grid-template-columns: 320px 1fr; gap: 24px; margin-top: 20px;">
                    <!-- CONTROL PANEL -->
                    <div class="control-panel" style="display: flex; flex-direction: column; gap: 16px;">
                        <div style="display: flex; gap: 12px;">
                            <div class="form-group" style="flex: 1; margin: 0;">
                                <label style="display: block; margin-bottom: 6px; color: var(--text-muted, #aaa); font-size: 0.9em;">Width (px):</label>
                                <input type="number" id="img-width" class="form-input" value="600" min="50" max="2000" style="width: 100%; padding: 8px 12px;">
                            </div>
                            <div class="form-group" style="flex: 1; margin: 0;">
                                <label style="display: block; margin-bottom: 6px; color: var(--text-muted, #aaa); font-size: 0.9em;">Height (px):</label>
                                <input type="number" id="img-height" class="form-input" value="400" min="50" max="2000" style="width: 100%; padding: 8px 12px;">
                            </div>
                        </div>

                        <!-- QUICK RATIO PRESETS -->
                        <div>
                            <label style="display: block; margin-bottom: 6px; color: var(--text-muted, #aaa); font-size: 0.85em;">Quick ratios:</label>
                            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                <button class="btn-preset btn-secondary" data-w="600" data-h="400" style="padding: 4px 8px; font-size: 0.8em; border-radius: 4px;">3:2 (600x400)</button>
                                <button class="btn-preset btn-secondary" data-w="800" data-h="800" style="padding: 4px 8px; font-size: 0.8em; border-radius: 4px;">1:1 (800x800)</button>
                                <button class="btn-preset btn-secondary" data-w="1920" data-h="1080" style="padding: 4px 8px; font-size: 0.8em; border-radius: 4px;">16:9 (Full HD)</button>
                            </div>
                        </div>

                        <!-- OPTIONS -->
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="display: flex; align-items: center; gap: 8px; color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">
                                <input type="checkbox" id="img-grayscale"> Black and white (Grayscale)
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">
                                <input type="checkbox" id="img-blur"> Blur
                            </label>
                        </div>

                        <button id="btn-gen-image" class="btn-primary" style="padding: 12px; margin-top: 10px;">🖼️ Generate New Picture</button>

                        <!-- ACTION BUTTONS -->
                        <div style="display: flex; gap: 8px; flex-direction: column; margin-top: 10px;">
                            <button id="btn-copy-url" class="btn-secondary" style="padding: 8px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; cursor: pointer; text-align: center;">
                                🔗 Copy Image URL
                            </button>
                            <a id="btn-open-tab" href="#" target="_blank" class="btn-secondary" style="padding: 8px 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; text-decoration: none; text-align: center;">
                                ↗️ Open in New Tab
                            </a>
                        </div>
                    </div>

                    <!-- DISPLAY PANEL -->
                    <div class="display-panel" style="
                        background: rgba(0,0,0,0.2); 
                        border: 1px dashed rgba(255,255,255,0.15); 
                        border-radius: 12px; 
                        padding: 16px; 
                        display: flex; 
                        justify-content: center; 
                        align-items: center;
                        min-height: 380px;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div id="img-loader" style="display: none; color: #10b981; font-weight: 500;">⏳ Loading...</div>
                        <img id="img-preview" src="" alt="Placeholder Preview" style="
                            max-width: 100%; 
                            max-height: 400px; 
                            object-fit: contain; 
                            border-radius: 8px; 
                            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
                            display: none;
                        ">
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
        this.generateImage();
    }

    bindEvents() {
        const btnGen = this.container.querySelector('#btn-gen-image');
        const btnCopy = this.container.querySelector('#btn-copy-url');
        const presets = this.container.querySelectorAll('.btn-preset');

        btnGen?.addEventListener('click', () => this.generateImage());

        presets.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const w = e.target.getAttribute('data-w');
                const h = e.target.getAttribute('data-h');
                this.container.querySelector('#img-width').value = w;
                this.container.querySelector('#img-height').value = h;
                this.generateImage();
            });
        });

        btnCopy?.addEventListener('click', () => {
            if (!this.currentUrl) return;
            navigator.clipboard.writeText(this.currentUrl);
            btnCopy.textContent = '✅ URL Copied!';
            setTimeout(() => btnCopy.textContent = '🔗 Copy Image URL', 1200);
        });
    }

    generateImage() {
        const width = parseInt(this.container.querySelector('#img-width').value) || 600;
        const height = parseInt(this.container.querySelector('#img-height').value) || 400;
        const isGrayscale = this.container.querySelector('#img-grayscale').checked;
        const isBlur = this.container.querySelector('#img-blur').checked;

        const loader = this.container.querySelector('#img-loader');
        const img = this.container.querySelector('#img-preview');
        const openTabBtn = this.container.querySelector('#btn-open-tab');

        // Build URL from Picsum
        let url = `https://picsum.photos/${width}/${height}`;
        let params = [];

        if (isGrayscale) params.push('grayscale');
        if (isBlur) params.push('blur=2');
        // Cache buster using timestamp
        params.push(`random=${Date.now()}`);

        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        this.currentUrl = url;
        if (openTabBtn) openTabBtn.href = url;

        // UI Loading
        if (loader) loader.style.display = 'block';
        if (img) img.style.display = 'none';

        const tempImg = new Image();
        tempImg.src = url;
        tempImg.onload = () => {
            if (img) {
                img.src = url;
                img.style.display = 'block';
            }
            if (loader) loader.style.display = 'none';
            this.playSuccessSFX();
        };

        // Save History Log
        historyManager.addLog('Image Placeholder', `${width}x${height} px`);
    }

    playSuccessSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } catch (e) {
            console.warn(e);
        }
    }
}