/* ==========================================================================
   MODULE: ROLL A DICE
   ========================================================================== */

import { historyManager } from '../history.js';

export default class DiceModule {
    constructor() {
        this.container = null;
        this.isRolling = false;
        // Tọa độ góc quay tương ứng với kết quả 1 -> 6
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
                    <label style="color: var(--text-muted, #aaa);">Số lượng xúc xắc:</label>
                    <select id="dice-count" class="dice-count-select">
                        <option value="1">1 Xúc xắc</option>
                        <option value="2">2 Xúc xắc</option>
                        <option value="3">3 Xúc xắc</option>
                    </select>
                </div>

                <div class="dice-container" id="dice-holder">
                    <!-- Render xúc xắc động tại đây -->
                </div>

                <button class="btn-primary" id="btn-roll-dice" style="max-width: 220px;">
                    🎲 Gieo Xúc Xắc
                </button>
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

        const diceElements = this.container.querySelectorAll('.dice');
        const btnRoll = this.container.querySelector('#btn-roll-dice');
        btnRoll.disabled = true;

        const results = [];

        diceElements.forEach((dice) => {
            const result = Math.floor(Math.random() * 6) + 1;
            results.push(result);

            // Quay nhiều vòng để tạo hiệu ứng
            const extraRoundsX = (Math.floor(Math.random() * 4) + 4) * 360;
            const extraRoundsY = (Math.floor(Math.random() * 4) + 4) * 360;

            const targetRot = this.rotations[result];
            const finalX = extraRoundsX + targetRot.x;
            const finalY = extraRoundsY + targetRot.y;

            dice.style.transform = `rotateX(${finalX}deg) rotateY(${finalY}deg)`;
        });

        // Chờ chạy hết Animation 1.5s
        setTimeout(() => {
            this.isRolling = false;
            btnRoll.disabled = false;

            const total = results.reduce((a, b) => a + b, 0);
            const logText = results.length > 1 
                ? `${results.join(' + ')} = ${total}` 
                : `${results[0]}`;

            historyManager.addLog('Roll a Dice', logText);
        }, 1500);
    }
}