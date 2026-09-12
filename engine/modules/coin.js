import { historyManager } from '../history.js';
import { sfxDice } from '../utils/sfx_dice.js';

export default class CoinModule {
    constructor() {
        this.container = null;
        this.isFlipping = false;
        this.currentRotation = 0;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="coin-workspace">
                <div class="coin-stage">
                    <div class="coin" id="coin-element">
                        <div class="coin-face coin-heads">HEADS</div>
                        <div class="coin-face coin-tails">TAILS</div>
                    </div>
                </div>
                <div class="coin-shadow" id="coin-shadow"></div>
                <div class="coin-result-display" id="coin-result">Nhấn để Tung Xu!</div>
                <button class="btn-primary" id="btn-flip-coin" style="max-width: 200px;">🪙 Tung Xu</button>
            </div>
        `;
        this.bindEvents();
    }

    bindEvents() {
        const btnFlip = this.container.querySelector('#btn-flip-coin');
        const coin = this.container.querySelector('#coin-element');

        btnFlip?.addEventListener('click', () => this.flipCoin());
        coin?.addEventListener('click', () => this.flipCoin());
    }

    flipCoin() {
        if (this.isFlipping) return;
        this.isFlipping = true;

        sfxDice.playTick(); // Âm thanh búng xu

        const coin = this.container.querySelector('#coin-element');
        const resultDisplay = this.container.querySelector('#coin-result');
        const btnFlip = this.container.querySelector('#btn-flip-coin');

        btnFlip.disabled = true;
        resultDisplay.textContent = 'Đang tung...';

        const isHeads = Math.random() < 0.5;
        const resultText = isHeads ? 'Heads (Mặt Ngửa)' : 'Tails (Mặt Sấp)';

        const extraRounds = 10;
        const targetAngle = isHeads ? 0 : 180;
        
        this.currentRotation += (extraRounds * 180) + targetAngle;
        if (this.currentRotation % 360 !== targetAngle) {
            this.currentRotation += 180;
        }

        coin.style.transform = `rotateY(${this.currentRotation}deg)`;

        setTimeout(() => {
            this.isFlipping = false;
            btnFlip.disabled = false;
            resultDisplay.textContent = resultText;
            historyManager.addLog('Flip a Coin', resultText);
        }, 3000);
    }
}