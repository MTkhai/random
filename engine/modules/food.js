/* ==========================================================================
   MODULE: FOOD PICKER (Fetch JSON & CS:GO Case Opening Style)
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

// Fallback data if fetching /data/food_data.json fails
const FALLBACK_FOODS = [
    { name: "Cơm tấm", sub: "Sườn bì chả • Việt Nam", price: 45, quip: "Sườn có thể gãy. Kèo này thì không." },
    { name: "Phở bò", sub: "Tái nạm • Việt Nam", price: 55, quip: "Đời có thể nhạt. Nước phở thì không." },
    { name: "Bánh mì", sub: "Thịt nướng • Việt Nam", price: 25, quip: "Vũ khí cận chiến của dân văn phòng." },
    { name: "Bún chả", sub: "Chả nướng • Việt Nam", price: 50, quip: "Một pha gắp chả đi vào lòng người." }
];

const TARGET_LUNCH_PRICE = 50;
const LOG_PRICE_SPREAD = 0.35;
const TICK_SECONDS = [0,.063,.125,.188,.250,.313,.375,.438,.500,.563,.625,.688,.750,.813,.875,.938,1,1.063,1.125,1.188,1.250,1.313,1.375,1.483,1.620,1.701,1.786,1.872,2.003,2.154,2.313,2.466,2.615,2.773,2.941,3.104,3.339,3.630,3.953,4.385,5.004];

function priceRarity(priceInThousands) {
    if (priceInThousands <= 40) return { label: "Common", color: "#b0c3d9" };
    if (priceInThousands <= 65) return { label: "Rare", color: "#5e98d9" };
    if (priceInThousands <= 100) return { label: "Epic", color: "#4b69ff" };
    if (priceInThousands <= 130) return { label: "Legendary", color: "#d32ce6" };
    return { label: "Mythic", color: "#eb4b4b" };
}

function chooseWeightedFood(population, target = TARGET_LUNCH_PRICE) {
    if (!population || !population.length) return null;
    const counts = new Map();
    population.forEach(f => counts.set(f.price, (counts.get(f.price) || 0) + 1));
    
    const logs = population.map(f => Math.log((f.price || 50) / 50));
    const prior = logs.map((x, i) => -0.5 * Math.pow(x / LOG_PRICE_SPREAD, 2) - Math.log(counts.get(population[i].price) || 1));

    function weights(tilt) {
        const logits = logs.map((x, i) => prior[i] + tilt * x);
        const anchor = Math.max(...logits);
        const raw = logits.map(x => Math.exp(x - anchor));
        const sum = raw.reduce((s, x) => s + x, 0);
        return raw.map(x => x / (sum || 1));
    }

    const mean = (w) => population.reduce((s, f, i) => s + f.price * w[i], 0);
    let lo = -1, hi = 1;
    while (mean(weights(lo)) > target) lo *= 2;
    while (mean(weights(hi)) < target) hi *= 2;
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

export default class FoodPickerModule {
    constructor() {
        this.container = null;
        this.foods = [];
        this.isSpinning = false;
    }

    async render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">🍲 Food Picker (Gacha CS:GO)</h2>
                <p class="module-desc">Data loaded from <code>/data/food_data.json</code> • Budget balancing algorithm for 50k.</p>

                <div class="food-workspace" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
                    <div class="food-panel">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="color: #aaa; display: block; margin-bottom: 5px;">Target price (k VND):</label>
                            <input type="number" id="target-price" class="form-input" value="50" min="20" max="200" style="width: 100%; padding: 10px;" />
                        </div>

                        <div id="data-status" style="font-size: 0.85rem; color: #fbbf24; margin-bottom: 10px;">⏳ Loading food list...</div>

                        <button id="btn-open-case" class="btn-primary" disabled style="width: 100%; padding: 14px; font-size: 1.1rem; background: #10b981; font-weight: bold; opacity: 0.6; cursor: not-allowed;">
                            🎰 SPIN RANDOM LUNCH
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
                        min-height: 220px;
                        text-align: center;
                        transition: all 0.3s ease;
                    ">
                        <div id="rarity-badge" style="font-size: 0.8rem; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; color: #888;">---</div>
                        <div id="food-title" style="font-size: 1.8rem; font-weight: bold; color: #fff; margin-bottom: 4px;">? ? ?</div>
                        <div id="food-sub" style="font-size: 0.9rem; color: #aaa; margin-bottom: 8px;">Press the button to open the lunch case</div>
                        <div id="food-price" style="font-size: 1.1rem; font-weight: bold; color: #10b981; margin-bottom: 12px;"></div>
                        <div id="food-quip" style="font-size: 0.85rem; font-style: italic; color: #d1d5db; max-width: 80%;"></div>
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
            let loadedFoods = null;

            try {
                const jsonModule = await import('../data/db_food.json', { with: { type: 'json' } });
                loadedFoods = jsonModule.default ?? jsonModule;
            } catch (importErr) {
                const res = await fetch('../data/db_food.json');
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                loadedFoods = await res.json();
            }

            this.foods = Array.isArray(loadedFoods) ? loadedFoods : [];

            if (statusEl) {
                statusEl.textContent = `✅ Loaded ${this.foods.length} dishes`;
                statusEl.style.color = '#10b981';
            }
        } catch (err) {
            console.warn('Could not load ../data/db_food.json, using fallback data instead:', err);
            this.foods = FALLBACK_FOODS;
            if (statusEl) {
                statusEl.textContent = `⚠️ Using default data (${this.foods.length} dishes)`;
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
        btnOpen?.addEventListener('click', () => this.spinCase());
    }

    spinCase() {
        if (this.isSpinning || !this.foods.length) return;
        this.isSpinning = true;

        const targetPrice = parseFloat(this.container.querySelector('#target-price').value) || 50;
        const selectedFood = chooseWeightedFood(this.foods, targetPrice);
        const rarity = priceRarity(selectedFood.price || 50);

        const card = this.container.querySelector('#case-display');
        const titleEl = this.container.querySelector('#food-title');
        const subEl = this.container.querySelector('#food-sub');
        const priceEl = this.container.querySelector('#food-price');
        const quipEl = this.container.querySelector('#food-quip');
        const badgeEl = this.container.querySelector('#rarity-badge');

        card.style.borderColor = "#333";
        badgeEl.textContent = "Opening the case...";
        badgeEl.style.color = "#888";
        priceEl.textContent = "";
        quipEl.textContent = "";

        TICK_SECONDS.forEach((sec, idx) => {
            setTimeout(() => {
                const randomSample = this.foods[Math.floor(Math.random() * this.foods.length)];
                titleEl.textContent = randomSample.name;
                subEl.textContent = randomSample.sub || '';
                this.playTickSFX(idx / TICK_SECONDS.length);
            }, sec * 1000);
        });

        const totalDurationMs = TICK_SECONDS[TICK_SECONDS.length - 1] * 1000;
        setTimeout(() => {
            titleEl.textContent = selectedFood.name;
            subEl.textContent = selectedFood.sub || '';
            priceEl.textContent = selectedFood.price ? `💵 ${selectedFood.price}.000 VND` : '';
            quipEl.textContent = selectedFood.quip ? `"${selectedFood.quip}"` : '';
            
            badgeEl.textContent = `★ ${rarity.label}`;
            badgeEl.style.color = rarity.color;
            card.style.borderColor = rarity.color;

            this.playDropSFX();
            historyManager.addLog('Food Picker', `${selectedFood.name} (${selectedFood.price || 50}k)`);
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