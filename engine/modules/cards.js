/* ==========================================================================
   MODULE: CARD DRAWER
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class CardDrawerModule {
    constructor() {
        this.container = null;
        this.suits = [
            { name: 'bích', symbol: '♠', color: '#0f172a' },
            { name: 'tép', symbol: '♣', color: '#0f172a' },
            { name: 'rô', symbol: '♦', color: '#ef4444' },
            { name: 'cơ', symbol: '♥', color: '#ef4444' }
        ];
        this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Card Drawer</h2>
                <p class="module-desc">Rút ngẫu nhiên các lá bài từ bộ bài Tây 52 lá chuẩn.</p>

                <div class="card-toolbar" style="display: flex; gap: 16px; margin: 20px 0; align-items: center; flex-wrap: wrap;">
                    <div class="form-group" style="margin: 0;">
                        <label style="color: var(--text-muted, #aaa); font-size: 0.9em; margin-right: 8px;">Số lượng rút:</label>
                        <select id="card-count" class="form-input" style="padding: 8px 12px;">
                            <option value="1">1 lá</option>
                            <option value="2">2 lá</option>
                            <option value="3">3 lá</option>
                            <option value="4">4 lá</option>
                            <option value="5" selected>5 lá</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin: 0; display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="card-allow-duplicate" style="cursor: pointer;">
                        <label for="card-allow-duplicate" style="color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">Cho phép rút trùng lá</label>
                    </div>

                    <button id="btn-draw-cards" class="btn-primary" style="margin-left: auto; padding: 10px 20px;">🎴 Rút Bài</button>
                </div>

                <div id="cards-display-container" style="
                    display: flex; 
                    gap: 16px; 
                    justify-content: center; 
                    align-items: center; 
                    min-height: 240px; 
                    margin-top: 20px; 
                    flex-wrap: wrap;
                ">
                    <div style="color: var(--text-muted, #888); font-style: italic;">Bấm "Rút Bài" để bắt đầu...</div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const btnDraw = this.container.querySelector('#btn-draw-cards');
        btnDraw?.addEventListener('click', () => this.drawCards());
    }

    drawCards() {
        const count = parseInt(this.container.querySelector('#card-count').value) || 1;
        const allowDuplicate = this.container.querySelector('#card-allow-duplicate').checked;
        const displayContainer = this.container.querySelector('#cards-display-container');

        // Tạo full 52 lá bài
        let fullDeck = [];
        this.suits.forEach(suit => {
            this.values.forEach(val => {
                fullDeck.push({ value: val, suit: suit.symbol, color: suit.color, suitName: suit.name });
            });
        });

        let drawnCards = [];

        if (allowDuplicate) {
            for (let i = 0; i < count; i++) {
                const rand = Math.floor(Math.random() * fullDeck.length);
                drawnCards.push(fullDeck[rand]);
            }
        } else {
            // Trộn bài Fisher-Yates
            for (let i = fullDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [fullDeck[i], fullDeck[j]] = [fullDeck[j], fullDeck[i]];
            }
            drawnCards = fullDeck.slice(0, count);
        }

        displayContainer.innerHTML = '';
        this.playCardShuffleSFX();

        // Render hiệu ứng từng lá bài
        drawnCards.forEach((card, idx) => {
            const cardEl = document.createElement('div');
            cardEl.style.cssText = `
                width: 120px;
                height: 180px;
                background: #ffffff;
                border-radius: 10px;
                box-shadow: 0 8px 16px rgba(0,0,0,0.3);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 12px;
                color: ${card.color};
                font-family: Arial, sans-serif;
                position: relative;
                transform: translateY(20px) scale(0.9);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                user-select: none;
            `;

            cardEl.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2rem; line-height: 1;">
                    ${card.value}<br><span style="font-size: 1rem;">${card.suit}</span>
                </div>
                <div style="font-size: 2.5rem; text-align: center; align-self: center;">
                    ${card.suit}
                </div>
                <div style="font-weight: bold; font-size: 1.2rem; line-height: 1; text-align: right; transform: rotate(180deg);">
                    ${card.value}<br><span style="font-size: 1rem;">${card.suit}</span>
                </div>
            `;

            displayContainer.appendChild(cardEl);

            // Xuất hiện lần lượt
            setTimeout(() => {
                cardEl.style.opacity = '1';
                cardEl.style.transform = 'translateY(0) scale(1)';
            }, idx * 100);
        });

        // Lưu log
        const logText = drawnCards.map(c => `${c.value}${c.suit}`).join(', ');
        historyManager.addLog('Card Drawer', logText);
    }

    playCardShuffleSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();

            const bufferSize = ctx.sampleRate * 0.12;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, ctx.currentTime);
            filter.Q.setValueAtTime(3, ctx.currentTime);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(output);

            noise.start();
        } catch (e) {
            console.warn(e);
        }
    }
}