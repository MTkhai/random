import { historyManager } from '../history.js';

export default class NumberModule {
    constructor() {
        this.container = null;
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Number Generator</h2>
                <p class="module-desc">Tạo số ngẫu nhiên trong khoảng tùy chỉnh với các tùy chọn nâng cao.</p>

                <div class="form-grid">
                    <div class="form-group">
                        <label for="num-min">Giá trị tối thiểu (Min)</label>
                        <input type="number" id="num-min" value="1" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="num-max">Giá trị tối đa (Max)</label>
                        <input type="number" id="num-max" value="100" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="num-count">Số lượng kết quả</label>
                        <input type="number" id="num-count" value="1" min="1" max="100" class="form-input">
                    </div>
                </div>

                <div class="form-options">
                    <label class="checkbox-label">
                        <input type="checkbox" id="num-unique">
                        <span>Không trùng lặp (Unique)</span>
                    </label>
                    <label class="checkbox-label">
                        <input type="checkbox" id="num-sort">
                        <span>Sắp xếp tăng dần</span>
                    </label>
                </div>

                <button id="btn-gen-number" class="btn-primary">
                    🚀 Tạo Số Ngẫu Nhiên
                </button>

                <div id="num-result-box" class="result-box hidden">
                    <span class="result-label">Kết quả:</span>
                    <div id="num-result-value" class="result-value">--</div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const btnGen = this.container.querySelector('#btn-gen-number');
        btnGen?.addEventListener('click', () => this.generateNumbers());
    }

    generateNumbers() {
        const min = parseInt(this.container.querySelector('#num-min').value) || 0;
        const max = parseInt(this.container.querySelector('#num-max').value) || 0;
        const count = parseInt(this.container.querySelector('#num-count').value) || 1;
        const isUnique = this.container.querySelector('#num-unique').checked;
        const isSort = this.container.querySelector('#num-sort').checked;

        if (min >= max) {
            alert('Giá trị Min phải nhỏ hơn Max!');
            return;
        }

        if (isUnique && count > (max - min + 1)) {
            alert('Khoảng giá trị không đủ để tạo các số không trùng lặp!');
            return;
        }

        let results = [];
        if (isUnique) {
            const pool = [];
            for (let i = min; i <= max; i++) pool.push(i);
            for (let i = 0; i < count; i++) {
                const randIndex = Math.floor(Math.random() * pool.length);
                results.push(pool.splice(randIndex, 1)[0]);
            }
        } else {
            for (let i = 0; i < count; i++) {
                const rand = Math.floor(Math.random() * (max - min + 1)) + min;
                results.push(rand);
            }
        }

        if (isSort) {
            results.sort((a, b) => a - b);
        }

        const resultStr = results.join(', ');

        // Hiển thị kết quả
        const resultBox = this.container.querySelector('#num-result-box');
        const resultValue = this.container.querySelector('#num-result-value');
        resultValue.textContent = resultStr;
        resultBox.classList.remove('hidden');

        // Lưu History
        historyManager.addLog('Number Generator', resultStr);
    }
}