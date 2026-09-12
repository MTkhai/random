import { historyManager } from '../history.js';
import { sfxSpinner } from '../utils/sfx_spinner.js';

export default class SpinnerModule {
    constructor() {
        this.entries = ['alpha(A)', 'beta(B)', 'charlie(C)', 'delta(D)' , 'echo(E)'];
        this.colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];
        this.currentAngle = 0;
        this.isSpinning = false;
        this.canvas = null;
        this.ctx = null;
    }

    render(container) {
        this.container = container;
        this.renderLayout();
        this.bindEvents();
        this.drawWheel();
    }

    renderLayout() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="spinner-workspace">
                <div class="spinner-stage">
                    <div class="wheel-wrapper">
                        <canvas id="wheel-canvas" width="800" height="800"></canvas>
                        <div class="wheel-pointer"></div>
                        <div class="wheel-center-btn" id="btn-spin">SPIN</div>
                    </div>
                </div>

                <div class="spinner-panel">
                    <div class="panel-header">
                        <span>Entries</span>
                        <span class="entries-badge" id="entries-count">${this.entries.length}</span>
                    </div>
                    <div class="panel-toolbar">
                        <button class="tool-btn" id="btn-shuffle">🔀 Shuffle</button>
                        <button class="tool-btn" id="btn-sort">🔤 Sort</button>
                    </div>
                    <textarea class="panel-textarea" id="spinner-textarea" spellcheck="false">${this.entries.join('\n')}</textarea>
                </div>
            </div>

            <!-- MODAL WINNER -->
            <div class="spinner-winner-modal" id="winner-modal">
                <div class="spinner-winner-card">
                    <div class="spinner-winner-header">We have a winner!</div>
                    <div class="spinner-winner-body" id="winner-name">---</div>
                    <div class="spinner-winner-footer">
                        <button class="btn-winner-close" id="btn-winner-close">Close</button>
                        <button class="btn-winner-remove" id="btn-winner-remove">Remove</button>
                    </div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('wheel-canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    bindEvents() {
        const textarea = document.getElementById('spinner-textarea');
        const btnSpin = document.getElementById('btn-spin');
        const btnShuffle = document.getElementById('btn-shuffle');
        const btnSort = document.getElementById('btn-sort');
        const btnClose = document.getElementById('btn-winner-close');
        const btnRemove = document.getElementById('btn-winner-remove');

        textarea.addEventListener('input', () => {
            const text = textarea.value;
            this.entries = text.split('\n').filter(e => e.trim() !== '');
            document.getElementById('entries-count').textContent = this.entries.length;
            this.drawWheel();
        });

        btnShuffle.addEventListener('click', () => {
            if (this.isSpinning) return;
            this.entries.sort(() => Math.random() - 0.5);
            textarea.value = this.entries.join('\n');
            this.drawWheel();
        });

        btnSort.addEventListener('click', () => {
            if (this.isSpinning) return;
            this.entries.sort((a, b) => a.localeCompare(b));
            textarea.value = this.entries.join('\n');
            this.drawWheel();
        });

        btnSpin.addEventListener('click', () => this.spin());
        this.canvas.addEventListener('click', () => this.spin());

        btnClose.addEventListener('click', () => this.hideModal());
        btnRemove.addEventListener('click', () => {
            const winner = document.getElementById('winner-name').textContent;
            this.entries = this.entries.filter(e => e !== winner);
            textarea.value = this.entries.join('\n');
            document.getElementById('entries-count').textContent = this.entries.length;
            this.drawWheel();
            this.hideModal();
        });
    }

    drawWheel() {
        if (!this.ctx) return;
        const numSlices = this.entries.length;
        const centerX = 400;
        const centerY = 400;
        const radius = 390;

        this.ctx.clearRect(0, 0, 800, 800);

        if (numSlices === 0) {
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#1e293b';
            this.ctx.fill();
            return;
        }

        const sliceAngle = (2 * Math.PI) / numSlices;

        for (let i = 0; i < numSlices; i++) {
            const startAngle = this.currentAngle + i * sliceAngle;
            const endAngle = startAngle + sliceAngle;

            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = this.colors[i % this.colors.length];
            this.ctx.fill();
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = '#0f172a';
            this.ctx.stroke();

            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + sliceAngle / 2);
            this.ctx.textAlign = 'right';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 36px sans-serif';
            this.ctx.fillText(this.entries[i], radius - 40, 12);
            this.ctx.restore();
        }
    }

    spin() {
    if (this.isSpinning || this.items.length < 2) return;
    this.isSpinning = true;

    const btnSpin = this.container.querySelector('#btn-spin');
    btnSpin.disabled = true;

    // Số vòng quay ngẫu nhiên (5 - 8 vòng) + góc ngẫu nhiên
    const extraRounds = Math.floor(Math.random() * 4) + 5;
    const randomDegree = Math.floor(Math.random() * 360);
    this.currentRotation += (extraRounds * 360) + randomDegree;

    const canvas = this.container.querySelector('#spinner-canvas');
    canvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.85, 0.35, 1.2)';
    canvas.style.transform = `rotate(${this.currentRotation}deg)`;

    // PHÁT TIẾNG TICK KHI ĐANG QUAY (chậm dần theo thời gian)
    let tickDelay = 50;
    const playSpinTicks = () => {
        if (!this.isSpinning) return;
        sfxSpinner.playTick();
        tickDelay += 15; // Tăng delay để tiếng tạch tạch chậm dần
        if (tickDelay < 400) {
            setTimeout(playSpinTicks, tickDelay);
        }
    };
    playSpinTicks();

    // KHI DỪNG BÁNH XE (Sau 4 giây animation)
    setTimeout(() => {
        this.isSpinning = false;
        btnSpin.disabled = false;

        // Tính toán ô trúng thưởng dựa trên góc quay cuối cùng
        const actualDegree = this.currentRotation % 360;
        const sliceAngle = 360 / this.items.length;
        
        // Kim chỉ ở đỉnh (270 độ / 12h)
        const winningIndex = Math.floor((360 - (actualDegree % 360) + 270) % 360 / sliceAngle);
        const winner = this.items[winningIndex];

        // PHÁT TIẾNG THẮNG GIẢI & LƯU LOG
        sfxSpinner.playWin();
        historyManager.addLog('Custom Spinner', winner);

        // Hiển thị kết quả
        const resultDisplay = this.container.querySelector('#spinner-result');
        if (resultDisplay) {
            resultDisplay.textContent = `🎉 Kết quả: ${winner}`;
        }
    }, 4000);
}

    calculateWinner() {
        const numSlices = this.entries.length;
        const sliceAngle = (2 * Math.PI) / numSlices;
        
        let normalizedAngle = (2 * Math.PI - (this.currentAngle % (2 * Math.PI))) % (2 * Math.PI);
        const winnerIndex = Math.floor(normalizedAngle / sliceAngle);
        const winner = this.entries[winnerIndex];

        document.getElementById('winner-name').textContent = winner;
        document.getElementById('winner-modal').classList.add('show');

        // Gọi đồng bộ qua historyManager.addLog
        historyManager.addLog('Custom Spinner', winner);
    }

    hideModal() {
        document.getElementById('winner-modal').classList.remove('show');
    }
}