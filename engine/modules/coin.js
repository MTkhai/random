/* ==========================================================================
   MODULE: FLIP A COIN
   ========================================================================== */

import { historyManager } from '../history.js';

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

                <button class="btn-primary" id="btn-flip-coin" style="max-width: 200px;">
                    🪙 Tung Xu
                </button>
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

        const coin = this.container.querySelector('#coin-element');
        const resultDisplay = this.container.querySelector('#coin-result');
        const btnFlip = this.container.querySelector('#btn-flip-coin');

        btnFlip.disabled = true;
        resultDisplay.textContent = 'Đang tung...';

        // Kết quả ngẫu nhiên: 'Heads' (Mặt Ngửa) hoặc 'Tails' (Mặt Sấp)
        const isHeads = Math.random() < 0.5;
        const resultText = isHeads ? 'Heads (Mặt Ngửa)' : 'Tails (Mặt Sấp)';

        // Cộng dồn góc quay để quay không bị giật lùi
        const extraRounds = 10; // 5 vòng quay full
        const targetAngle = isHeads ? 0 : 180;
        
        // Tính tổng góc quay tiếp theo
        this.currentRotation += (extraRounds * 180) + targetAngle;
        if (this.currentRotation % 360 !== targetAngle) {
            this.currentRotation += 180;
        }

        coin.style.transform = `rotateY(${this.currentRotation}deg)`;

        // Đợi 3 giây chạy hết Animation CSS
        setTimeout(() => {
            this.isFlipping = false;
            btnFlip.disabled = false;
            resultDisplay.textContent = resultText;

            // Ghi Log vào History chung
            historyManager.addLog('Flip a Coin', resultText);
        }, 3000);
    }
}