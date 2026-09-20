/* ==========================================================================
   MODULE: FOOD PICKER (Gacha CS:GO - Refactored & Bug-free)
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

const IMG_BASE_PATH = './data/img/';

const FALLBACK_FOODS = [
    { id: "f1", name: "Cơm tấm", sub: "Sườn bì chả • Việt Nam", price: 45, quip: "Sườn có thể gãy. Kèo này thì không." },
    { id: "f2", name: "Phở bò", sub: "Tái nạm • Việt Nam", price: 55, quip: "Đời có thể nhạt. Nước phở thì không." },
    { id: "f3", name: "Bánh mì", sub: "Thịt nướng • Việt Nam", price: 25, quip: "Vũ khí cận chiến của dân văn phòng." },
    { id: "f4", name: "Bún chả", sub: "Chả nướng • Việt Nam", price: 50, quip: "Một pha gắp chả đi vào lòng người." }
];

const TARGET_LUNCH_PRICE = 50;
const LOG_PRICE_SPREAD = 0.35;
const TICK_SECONDS = [0,.063,.125,.188,.250,.313,.375,.438,.500,.563,.625,.688,.750,.813,.875,.938,1,1.063,1.125,1.188,1.250,1.313,1.375,1.483,1.620,1.701,1.786,1.872,2.003,2.154,2.313,2.466,2.615,2.773,2.941,3.104,3.339,3.630,3.953,4.385,5.004];

/* --------------------------------------------------------------------------
   HELPERS & DATA CLEANING
   -------------------------------------------------------------------------- */

// [FIX 6]: Phân biệt rõ ràng price === 0 với null/undefined/NaN
function getFoodPrice(food) {
    if (typeof food?.price === 'number' && !isNaN(food.price)) {
        return food.price;
    }
    return 50;
}

// [FIX 2]: Lấy ID duy nhất (ưu tiên id -> fallback name chuẩn hóa)
function getFoodId(food) {
    if (food.id !== undefined && food.id !== null) {
        return String(food.id);
    }
    return food.name ? food.name.trim().toLowerCase() : Math.random().toString();
}

function getRarityKey(priceInThousands) {
    if (priceInThousands <= 40) return "common";
    if (priceInThousands <= 65) return "uncommon";
    if (priceInThousands <= 100) return "rare";
    if (priceInThousands <= 130) return "epic";
    return "legendary";
}

function priceRarity(priceInThousands) {
    const key = getRarityKey(priceInThousands);
    switch (key) {
        case "common": return { key: "common", label: "Phổ Thông", color: "#b0c3d9" };
        case "uncommon": return { key: "uncommon", label: "Đặc Biệt", color: "#5e98d9" };
        case "rare": return { key: "rare", label: "Hiếm", color: "#4b69ff" };
        case "epic": return { key: "epic", label: "Cực Hiếm", color: "#d32ce6" };
        case "legendary": return { key: "legendary", label: "Huyền Thoại", color: "#eb4b4b" };
    }
}

/* --------------------------------------------------------------------------
   GACHA WEIGHTING ALGORITHM
   -------------------------------------------------------------------------- */

function chooseWeightedFood(population, rawTarget = TARGET_LUNCH_PRICE) {
    if (!population || !population.length) return null;
    if (population.length === 1) return population[0];

    const prices = population.map(getFoodPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // [FIX 1]: Clamp target vào đúng khoảng [minPrice, maxPrice] của danh sách hiện tại
    const target = Math.max(minPrice, Math.min(maxPrice, rawTarget));

    // Nếu tất cả món trong pool có cùng mức giá, random đều
    if (minPrice === maxPrice) {
        return population[Math.floor(Math.random() * population.length)];
    }

    // [FIX 7]: Mật độ giá (counts) dùng để cân bằng giữa các phân khúc giá khác nhau
    const counts = new Map();
    prices.forEach(p => counts.set(p, (counts.get(p) || 0) + 1));
    
    const logs = prices.map(p => Math.log(p / 50));
    const prior = logs.map((x, i) => -0.5 * Math.pow(x / LOG_PRICE_SPREAD, 2) - Math.log(counts.get(prices[i]) || 1));

    function weights(tilt) {
        const logits = logs.map((x, i) => prior[i] + tilt * x);
        const anchor = Math.max(...logits);
        const raw = logits.map(x => Math.exp(x - anchor));
        const sum = raw.reduce((s, x) => s + x, 0);
        return raw.map(x => x / (sum || 1));
    }

    const mean = (w) => population.reduce((s, f, i) => s + prices[i] * w[i], 0);
    
    let lo = -1, hi = 1;
    let guard = 0;

    // [FIX 1]: Thêm điều kiện dừng guard loop để chống treo UI tuyệt đối
    while (mean(weights(lo)) > target && guard < 50) {
        lo *= 2;
        guard++;
    }
    guard = 0;
    while (mean(weights(hi)) < target && guard < 50) {
        hi *= 2;
        guard++;
    }

    for (let i = 0; i < 40; i++) {
        const mid = (lo + hi) / 2;
        if (mean(weights(mid)) < target) lo = mid; else hi = mid;
    }

    const w = weights((lo + hi) / 2);
    let draw = Math.random();
    for (let i = 0; i < population.length; i++) {
        if ((draw -= w[i]) < 0) return population[i];
    }
    return population[0];
}

/* --------------------------------------------------------------------------
   MODULE CLASS
   -------------------------------------------------------------------------- */

export default class FoodPickerModule {
    constructor() {
        this.container = null;
        this.foods = [];
        this.drawnFoodIds = new Set(); // [FIX 2]: Lưu Set theo ID/Key thay vì Name
        this.isSpinning = false;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">🍲 Food Picker (Gacha CS:GO)</h2>
                <p class="module-desc">Dữ liệu nạp từ <code>./data/db_food.json</code> • Thuật toán cân bằng ngân sách & gacha linh hoạt.</p>

                <div class="food-workspace" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div class="food-panel">
                        <div class="form-group" style="margin-bottom: 12px;">
                            <label style="color: #aaa; display: block; margin-bottom: 5px;">Mức giá mục tiêu (k VNĐ):</label>
                            <input type="number" id="target-price" class="form-input" value="50" min="20" max="200" style="width: 100%; padding: 8px;" />
                        </div>

                        <div class="form-group" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="chk-random-price" style="width: 16px; height: 16px; cursor: pointer;" />
                            <label for="chk-random-price" style="color: #ddd; cursor: pointer; user-select: none;">🎲 Ngẫu nhiên hoàn toàn (Bỏ qua mức giá)</label>
                        </div>

                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="color: #aaa; display: block; margin-bottom: 5px;">Lọc theo độ phẩm/hiếm:</label>
                            <select id="select-rarity" class="form-input" style="width: 100%; padding: 8px; background: #1e1e24; color: #fff; border: 1px solid #444; border-radius: 6px;">
                                <option value="all">✨ Tất cả độ hiếm</option>
                                <option value="common">⚪ Phổ Thông (<= 40k)</option>
                                <option value="uncommon">🔵 Đặc Biệt (41k - 65k)</option>
                                <option value="rare">🔷 Hiếm (66k - 100k)</option>
                                <option value="epic">🟣 Cực Hiếm (101k - 130k)</option>
                                <option value="legendary">🔴 Huyền Thoại (> 130k)</option>
                            </select>
                        </div>

                        <div id="data-status" style="font-size: 0.85rem; color: #fbbf24; margin-bottom: 10px;">⏳ Đang tải danh sách món ăn...</div>

                        <button id="btn-open-case" class="btn-primary" disabled style="width: 100%; padding: 14px; font-size: 1.1rem; background: #10b981; font-weight: bold; opacity: 0.6; cursor: not-allowed; border: none; border-radius: 8px; color: #fff;">
                            🎰 QUAY MÓN NGẪU NHIÊN
                        </button>
                    </div>

                    <div id="case-display" style="
                        background: rgba(0, 0, 0, 0.4);
                        border: 2px solid #333;
                        border-radius: 12px;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 260px;
                        text-align: center;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    ">
                        <div id="rarity-badge" style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; color: #888;">---</div>
                        
                        <div id="food-img-container" style="
                            width: 110px; 
                            height: 110px; 
                            border-radius: 50%; 
                            overflow: hidden; 
                            margin-bottom: 12px; 
                            border: 3px solid #444; 
                            background: #111;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                        ">
                            <img id="food-img" src="${IMG_BASE_PATH}${DEFAULT_IMG}" alt="Food Icon" style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>

                        <div id="food-title" style="font-size: 1.6rem; font-weight: bold; color: #fff; margin-bottom: 4px;">? ? ?</div>
                        <div id="food-sub" style="font-size: 0.85rem; color: #aaa; margin-bottom: 8px;">Ấn nút để mở hòm bữa trưa</div>
                        <div id="food-price" style="font-size: 1.1rem; font-weight: bold; color: #10b981; margin-bottom: 8px;"></div>
                        <div id="food-quip" style="font-size: 0.85rem; font-style: italic; color: #d1d5db; max-width: 85%;"></div>
                    </div>
                </div>
            </div>
        `;

        await this.loadFoodData();
        this.bindEvents();
    }

    async loadFoodData() {
        const statusEl = this.container.querySelector('#data-status');
        const btnOpen = this.container.querySelector('#btn-open-case');

        try {
            const res = await fetch('./data/db_food.json');
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            this.foods = await res.json();
            
            if (statusEl) {
                statusEl.textContent = `✅ Đã tải ${this.foods.length} món từ ./data/db_food.json`;
                statusEl.style.color = '#10b981';
            }
        } catch (err) {
            console.warn('Không fetch được ./data/db_food.json, dùng data dự phòng:', err);
            this.foods = FALLBACK_FOODS;
            if (statusEl) {
                statusEl.textContent = `⚠️ Đang dùng dữ liệu mặc định (${this.foods.length} món)`;
                statusEl.style.color = '#f59e0b';
            }
        }

        if (btnOpen) {
            btnOpen.disabled = false;
            btnOpen.style.opacity = '1';
            btnOpen.style.cursor = 'pointer';
        }
    }

    bindEvents() {
        const btnOpen = this.container.querySelector('#btn-open-case');
        const chkRandom = this.container.querySelector('#chk-random-price');
        const targetPriceInput = this.container.querySelector('#target-price');

        chkRandom?.addEventListener('change', (e) => {
            if (targetPriceInput) {
                targetPriceInput.disabled = e.target.checked;
                targetPriceInput.style.opacity = e.target.checked ? '0.4' : '1';
            }
        });

        // [FIX 5]: Clamp giá trị input ngay khi thay đổi giá trị
        targetPriceInput?.addEventListener('change', () => {
            let val = parseFloat(targetPriceInput.value) || 50;
            val = Math.max(20, Math.min(200, val));
            targetPriceInput.value = val;
        });

        btnOpen?.addEventListener('click', () => this.spinCase());
    }

    spinCase() {
        if (this.isSpinning || !this.foods.length) return;

        const rarityFilter = this.container.querySelector('#select-rarity').value;
        const isRandomPrice = this.container.querySelector('#chk-random-price').checked;
        
        // [FIX 5]: Validate & Clamp targetPrice cẩn thận trong JS
        let rawTarget = parseFloat(this.container.querySelector('#target-price').value) || 50;
        const targetPrice = Math.max(20, Math.min(200, rawTarget));

        let eligibleFoods = this.foods;
        if (rarityFilter !== 'all') {
            eligibleFoods = eligibleFoods.filter(f => getRarityKey(getFoodPrice(f)) === rarityFilter);
        }

        if (eligibleFoods.length === 0) {
            alert('Không tìm thấy món nào phù hợp với bộ lọc độ hiếm này!');
            return;
        }

        let availableFoods = eligibleFoods.filter(f => !this.drawnFoodIds.has(getFoodId(f)));

        // [FIX 3]: Chỉ xỏa trạng thái "đã quay" của riêng bộ lọc hiện tại, không làm ảnh hưởng bộ lọc khác
        if (availableFoods.length === 0) {
            eligibleFoods.forEach(f => this.drawnFoodIds.delete(getFoodId(f)));
            availableFoods = eligibleFoods;
        }

        let selectedFood;
        if (isRandomPrice) {
            const randomIndex = Math.floor(Math.random() * availableFoods.length);
            selectedFood = availableFoods[randomIndex];
        } else {
            selectedFood = chooseWeightedFood(availableFoods, targetPrice);
        }

        this.drawnFoodIds.add(getFoodId(selectedFood));

        this.isSpinning = true;
        const finalPrice = getFoodPrice(selectedFood);
        const rarity = priceRarity(finalPrice);

        const card = this.container.querySelector('#case-display');
        const imgEl = this.container.querySelector('#food-img');
        const imgContainer = this.container.querySelector('#food-img-container');
        const titleEl = this.container.querySelector('#food-title');
        const subEl = this.container.querySelector('#food-sub');
        const priceEl = this.container.querySelector('#food-price');
        const quipEl = this.container.querySelector('#food-quip');
        const badgeEl = this.container.querySelector('#rarity-badge');

        card.style.borderColor = "#333";
        imgContainer.style.borderColor = "#444";
        badgeEl.textContent = "Đang mở hòm...";
        badgeEl.style.color = "#888";
        priceEl.textContent = "";
        quipEl.textContent = "";

        // [FIX 4]: Animation dùng availableFoods thay vì eligibleFoods để đồng bộ cảm giác gacha
        TICK_SECONDS.forEach((sec, idx) => {
            setTimeout(() => {
                const randomSample = availableFoods[Math.floor(Math.random() * availableFoods.length)];
                titleEl.textContent = randomSample.name;
                subEl.textContent = randomSample.sub || '';
                
                const sampleImg = randomSample.image || randomSample.img || DEFAULT_IMG;
                imgEl.src = `${IMG_BASE_PATH}${sampleImg}`;

                this.playTickSFX(idx / TICK_SECONDS.length);
            }, sec * 1000);
        });

        const totalDurationMs = TICK_SECONDS[TICK_SECONDS.length - 1] * 1000;
        setTimeout(() => {
            titleEl.textContent = selectedFood.name;
            subEl.textContent = selectedFood.sub || '';
            priceEl.textContent = `💵 ${finalPrice}.000 VNĐ`;
            quipEl.textContent = selectedFood.quip ? `"${selectedFood.quip}"` : '';
            
            const finalImg = selectedFood.image || selectedFood.img || DEFAULT_IMG;
            imgEl.src = `${IMG_BASE_PATH}${finalImg}`;

            badgeEl.textContent = `★ ${rarity.label}`;
            badgeEl.style.color = rarity.color;
            card.style.borderColor = rarity.color;
            imgContainer.style.borderColor = rarity.color;

            this.playDropSFX();
            historyManager.addLog('Food Picker', `${selectedFood.name} (${finalPrice}k)`);
            this.isSpinning = false;
        }, totalDurationMs + 100);
    }

    playTickSFX(progress) {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(300 + progress * 200, ctx.currentTime);

            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.02);
        } catch (e) {}
    }

    playDropSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(659.25, ctx.currentTime);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

            osc.connect(gain);
            gain.connect(output);

            osc.start();
            osc.stop(ctx.currentTime + 0.35);
        } catch (e) {}
    }
}