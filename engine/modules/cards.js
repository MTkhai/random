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
                <p class="module-desc">Draw random cards from a standard deck, Tarot deck, or custom number deck.</p>

                <div class="card-toolbar" style="display: flex; gap: 16px; margin: 20px 0; align-items: center; flex-wrap: wrap;">
                    <div class="form-group" style="margin: 0;">
                        <label style="color: var(--text-muted, #aaa); font-size: 0.9em; margin-right: 6px;">Deck type:</label>
                        <select id="deck-type" class="form-input" style="padding: 8px 12px;">
                            <option value="poker52" selected>Standard 52-card deck</option>
                            <option value="tarot78">Tarot deck (78 cards)</option>
                            <option value="custom">Custom number deck</option>
                        </select>
                    </div>

                    <div class="form-group" id="custom-deck-group" style="margin: 0; display: none; align-items: center; gap: 6px;">
                        <label style="color: var(--text-muted, #aaa); font-size: 0.9em;">Total cards:</label>
                        <input type="number" id="custom-deck-size" class="form-input" value="45" min="1" max="500" style="width: 70px; padding: 6px 10px;">
                    </div>

                    <div class="form-group" style="margin: 0;">
                        <label style="color: var(--text-muted, #aaa); font-size: 0.9em; margin-right: 6px;">Cards to draw:</label>
                        <select id="card-count" class="form-input" style="padding: 8px 12px;">
                            <option value="1">1 card</option>
                            <option value="2">2 cards</option>
                            <option value="3">3 cards</option>
                            <option value="4" selected>4 cards</option>
                            <option value="5">5 cards</option>
                            <option value="6">6 cards</option>
                        </select>
                    </div>

                    <div class="form-group" style="margin: 0; display: flex; align-items: center; gap: 6px;">
                        <input type="checkbox" id="card-allow-duplicate" style="cursor: pointer;">
                        <label for="card-allow-duplicate" style="color: var(--text-muted, #aaa); font-size: 0.9em; cursor: pointer;">Allow duplicate draws</label>
                    </div>

                    <button id="btn-draw-cards" class="btn-primary" style="margin-left: auto; padding: 10px 20px;">🎴 Draw Cards</button>
                </div>

                <div id="cards-display-container" style="
    display: flex; 
    gap: 16px; 
    justify-content: center; 
    align-items: center; 
    min-height: 240px; 
    margin-top: 20px;
    flex-wrap: nowrap;
">
                    <div style="color: var(--text-muted, #888); font-style: italic;">Click "Draw Cards" to begin...</div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const btnDraw = this.container.querySelector('#btn-draw-cards');
        const deckType = this.container.querySelector('#deck-type');
        const customGroup = this.container.querySelector('#custom-deck-group');

        deckType?.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customGroup.style.display = 'flex';
            } else {
                customGroup.style.display = 'none';
            }
        });

        btnDraw?.addEventListener('click', () => this.drawCards());
    }

    generateDeck(type) {
        let deck = [];

        if (type === 'poker52') {
            this.suits.forEach(suit => {
                this.values.forEach(val => {
                    deck.push({ 
                        value: val, 
                        suit: suit.symbol, 
                        color: suit.color, 
                        label: `${val}${suit.symbol}` 
                    });
                });
            });
        } else if (type === 'tarot78') {
            // Tarot Major Arcana & Minor Arcana
            const majorArcana = [
                'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
                'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
                'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
                'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun', 'Judgement', 'The World'
            ];
            majorArcana.forEach((name, idx) => {
                deck.push({
                    value: idx.toString(),
                    suit: '✨',
                    color: '#8b5cf6',
                    label: name,
                    isTarot: true
                });
            });

            const tarotSuits = [
                { symbol: '🗡️', color: '#3b82f6', name: 'Swords' },
                { symbol: '🏆', color: '#eab308', name: 'Cups' },
                { symbol: '🪄', color: '#ef4444', name: 'Wands' },
                { symbol: '🪙', color: '#10b981', name: 'Pentacles' }
            ];
            const tarotValues = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Page', 'Knight', 'Queen', 'King'];

            tarotSuits.forEach(suit => {
                tarotValues.forEach(val => {
                    deck.push({
                        value: val,
                        suit: suit.symbol,
                        color: suit.color,
                        label: `${val} of ${suit.name}`,
                        isTarot: true
                    });
                });
            });
        } else {
            // Custom Size Deck (Ví dụ: 1 đến N)
            const size = parseInt(this.container.querySelector('#custom-deck-size').value) || 45;
            for (let i = 1; i <= size; i++) {
                deck.push({
                    value: `#${i}`,
                    suit: '🎴',
                    color: '#10b981',
                    label: `Lá số ${i}`,
                    isCustom: true
                });
            }
        }

        return deck;
    }

    drawCards() {
        const type = this.container.querySelector('#deck-type').value;
        const count = parseInt(this.container.querySelector('#card-count').value) || 1;
        const allowDuplicate = this.container.querySelector('#card-allow-duplicate').checked;
        const displayContainer = this.container.querySelector('#cards-display-container');

        let fullDeck = this.generateDeck(type);

        if (count > fullDeck.length && !allowDuplicate) {
            alert(`Số lượng lá rút (${count}) lớn hơn tổng số lá của bộ bài (${fullDeck.length})! Vui lòng tích chọn "Cho phép rút trùng lá".`);
            return;
        }

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

        // Render từng lá bài
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
                padding: 10px;
                color: ${card.color};
                font-family: Arial, sans-serif;
                position: relative;
                transform: translateY(20px) scale(0.9);
                opacity: 0;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                user-select: none;
            `;

            if (card.isTarot || card.isCustom) {
                cardEl.innerHTML = `
                    <div style="font-weight: bold; font-size: 0.85rem; word-break: break-word;">${card.value}</div>
                    <div style="font-size: 2.2rem; text-align: center;">${card.suit}</div>
                    <div style="font-size: 0.75rem; text-align: center; color: #475569; font-weight: 600;">${card.label}</div>
                `;
            } else {
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
            }

            displayContainer.appendChild(cardEl);

            setTimeout(() => {
                cardEl.style.opacity = '1';
                cardEl.style.transform = 'translateY(0) scale(1)';
            }, idx * 100);
        });

        // Lưu Log
        const logText = drawnCards.map(c => c.label).join(', ');
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