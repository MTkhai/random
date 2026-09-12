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
        this.particles = [];
        this.fireworkAnimation = null;
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
            <div class="spinner-workspace" style="position: relative;">
                <canvas id="firework-canvas" style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:99;"></canvas>
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
        if (this.isSpinning || this.entries.length === 0) return;
        this.isSpinning = true;

        const spinRounds = 5 + Math.random() * 5;
        const randomTargetAngle = Math.random() * 2 * Math.PI;
        const totalRotation = spinRounds * 2 * Math.PI + randomTargetAngle;
        
        const startAngle = this.currentAngle;
        const startTime = performance.now();
        const duration = 4500;

        const numSlices = this.entries.length;
        const sliceAngle = (2 * Math.PI) / numSlices;
        let lastSliceIndex = -1;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                this.currentAngle = startAngle + totalRotation * easeOut;
                this.drawWheel();

                const currentSliceIndex = Math.floor((this.currentAngle % (2 * Math.PI)) / sliceAngle);
                if (currentSliceIndex !== lastSliceIndex) {
                    sfxSpinner.playTick();
                    lastSliceIndex = currentSliceIndex;
                }

                requestAnimationFrame(animate);
            } else {
                this.currentAngle = (startAngle + totalRotation) % (2 * Math.PI);
                this.drawWheel();
                this.isSpinning = false;
                this.calculateWinner();
            }
        };

        requestAnimationFrame(animate);
    }

    calculateWinner() {
        const numSlices = this.entries.length;
        const sliceAngle = (2 * Math.PI) / numSlices;
        
        let normalizedAngle = (2 * Math.PI - (this.currentAngle % (2 * Math.PI))) % (2 * Math.PI);
        const winnerIndex = Math.floor(normalizedAngle / sliceAngle);
        const winner = this.entries[winnerIndex];

        document.getElementById('winner-name').textContent = winner;
        document.getElementById('winner-modal').classList.add('show');

        // PHÁT TIẾNG THẮNG & BẮN PHÁO HOA
        sfxSpinner.playWin();
        sfxSpinner.playFireworks();
        this.triggerFireworks();

        historyManager.addLog('Custom Spinner', winner);
    }

    // Hiệu ứng pháo hoa bắn tung tóe
    triggerFireworks() {
        const fwCanvas = document.getElementById('firework-canvas');
        if (!fwCanvas) return;
        const ctx = fwCanvas.getContext('2d');
        fwCanvas.width = fwCanvas.offsetWidth;
        fwCanvas.height = fwCanvas.offsetHeight;

        this.particles = [];
        const colors = ['#f43f5e', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

        // Tạo 100 hạt pháo hoa
        for (let i = 0; i < 120; i++) {
            this.particles.push({
                x: fwCanvas.width / 2,
                y: fwCanvas.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12 - 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                radius: Math.random() * 4 + 2,
                alpha: 1
            });
        }

        const renderFw = () => {
            ctx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
            let alive = false;

            this.particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.15; // Trọng lực
                p.alpha -= 0.015;

                if (p.alpha > 0) {
                    alive = true;
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });

            if (alive) {
                this.fireworkAnimation = requestAnimationFrame(renderFw);
            }
        };

        renderFw();
    }

    hideModal() {
        const modal = document.getElementById('winner-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        if (this.fireworkAnimation) {
            cancelAnimationFrame(this.fireworkAnimation);
        }
    }
}