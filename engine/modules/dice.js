import { historyManager } from '../history.js';
import { sfxDice } from '../utils/sfx_dice.js';

export default class DiceModule {
    constructor() {
        this.container = null;
        this.isRolling = false;
        this.rotations = {
            1: { x: 0, y: 0 },
            2: { x: 0, y: -90 },
            3: { x: 0, y: -180 },
            4: { x: 0, y: 90 },
            5: { x: -90, y: 0 },
            6: { x: 90, y: 0 }
        };
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="dice-workspace">
                <div class="dice-controls">
                    <label style="color: var(--text-muted, #aaa);">Number of dice:</label>
                    <select id="dice-count" class="dice-count-select">
                        <option value="1">1 Die</option>
                        <option value="2">2 Dice</option>
                        <option value="3">3 Dice</option>
                    </select>
                </div>
                <div class="dice-container" id="dice-holder"></div>
                <button class="btn-primary" id="btn-roll-dice" style="max-width: 220px;">🎲 Roll Dice</button>
            </div>
        `;
        this.updateDiceCount(1);
        this.bindEvents();
    }

    bindEvents() {
        const btnRoll = this.container.querySelector('#btn-roll-dice');
        const countSelect = this.container.querySelector('#dice-count');

        btnRoll?.addEventListener('click', () => this.rollAll());
        countSelect?.addEventListener('change', (e) => this.updateDiceCount(parseInt(e.target.value)));
    }

    updateDiceCount(count) {
        const holder = this.container.querySelector('#dice-holder');
        holder.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const diceHTML = `
                <div class="dice-scene">
                    <div class="dice" data-index="${i}">
                        <div class="dice-face face-1"><span class="dot"></span></div>
                        <div class="dice-face face-2"><span class="dot"></span><span class="dot"></span></div>
                        <div class="dice-face face-3"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
                        <div class="dice-face face-4"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
                        <div class="dice-face face-5"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
                        <div class="dice-face face-6"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
                    </div>
                </div>
            `;
            holder.insertAdjacentHTML('beforeend', diceHTML);
        }
    }

    rollAll() {
        if (this.isRolling) return;
        this.isRolling = true;

        sfxDice.playResult(); // Âm thanh xóc xúc xắc

        const diceElements = this.container.querySelectorAll('.dice');
        const btnRoll = this.container.querySelector('#btn-roll-dice');
        btnRoll.disabled = true;

        const results = [];

        diceElements.forEach((dice) => {
            const result = Math.floor(Math.random() * 6) + 1;
            results.push(result);

            const extraRoundsX = (Math.floor(Math.random() * 4) + 4) * 360;
            const extraRoundsY = (Math.floor(Math.random() * 4) + 4) * 360;

            const targetRot = this.rotations[result];
            const finalX = extraRoundsX + targetRot.x;
            const finalY = extraRoundsY + targetRot.y;

            dice.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;
        });

        setTimeout(() => {
            this.isRolling = false;
            btnRoll.disabled = false;

            const total = results.reduce((a, b) => a + b, 0);
            const logText = results.length > 1 ? `${results.join(' + ')} = ${total}` : `${results[0]}`;
            historyManager.addLog('Roll a Dice', logText);
        }, 1500);
    }
}