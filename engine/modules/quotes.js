/* ==========================================================================
   MODULE: RANDOM QUOTES GENERATOR (ONLINE API)
   ========================================================================== */

import { soundMaster } from '../utils/sound_master.js';
import { historyManager } from '../history.js';

export default class RandomQuotesModule {
    constructor() {
        this.container = null;
        this.currentQuote = { text: '', author: '' };
        // Free quote APIs that do not require an API key
        this.apiUrls = [
            'https://dummyjson.com/quotes/random',
            'https://api.quotable.io/random'
        ];
    }

    render(container) {
        this.container = container;
        this.container.innerHTML = `
            <div class="module-card">
                <h2 class="module-title">Random Quotes</h2>
                <p class="module-desc">Get a random inspirational quote from an online API.</p>
                
                <div class="quote-display-box" style="
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 32px 24px;
                    margin: 24px 0;
                    text-align: center;
                    min-height: 180px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    position: relative;
                ">
                    <div id="quote-text" style="font-size: 1.25rem; font-style: italic; line-height: 1.6; color: #f8fafc; margin-bottom: 16px;">
                        "Loading quote..."
                    </div>
                    <div id="quote-author" style="font-size: 0.95rem; font-weight: 600; color: #10b981;">
                        — Loading...
                    </div>
                </div>

                <div class="quote-actions" style="display: flex; gap: 12px; justify-content: center;">
                    <button id="btn-next-quote" class="btn-primary" style="padding: 10px 20px;">
                        📖 New Quote
                    </button>
                    <button id="btn-copy-quote" class="btn-secondary" style="
                        padding: 10px 20px; 
                        background: rgba(255,255,255,0.08); 
                        border: 1px solid rgba(255,255,255,0.15); 
                        color: #fff; 
                        border-radius: 8px; 
                        cursor: pointer;
                    ">
                        📋 Copy Quote
                    </button>
                </div>
            </div>
        `;

        this.bindEvents();
        this.fetchOnlineQuote();
    }

    bindEvents() {
        const btnNext = this.container.querySelector('#btn-next-quote');
        const btnCopy = this.container.querySelector('#btn-copy-quote');

        btnNext?.addEventListener('click', () => {
            this.playPageTurnSFX();
            this.fetchOnlineQuote();
        });

        btnCopy?.addEventListener('click', () => {
            if (!this.currentQuote.text) return;
            const fullText = `"${this.currentQuote.text}" — ${this.currentQuote.author}`;
            navigator.clipboard.writeText(fullText);
            
            btnCopy.textContent = '✅ Copied!';
            setTimeout(() => btnCopy.textContent = '📋 Copy Quote', 1200);
        });
    }

    async fetchOnlineQuote() {
        const textEl = this.container.querySelector('#quote-text');
        const authorEl = this.container.querySelector('#quote-author');
        
        if (textEl) textEl.style.opacity = '0.5';

        try {
            // Fetch from the primary API
            const res = await fetch('https://dummyjson.com/quotes/random');
            if (!res.ok) throw new Error('API Primary Failed');
            const data = await res.json();
            
            this.currentQuote = {
                text: data.quote,
                author: data.author
            };
        } catch (err) {
            // Fallback when blocked by CORS/offline: use a backup API or static content
            try {
                const res2 = await fetch('https://api.allorigins.win/raw?url=https://zenquotes.io/api/random');
                const data2 = await res2.json();
                this.currentQuote = {
                    text: data2[0].q,
                    author: data2[0].a
                };
            } catch (fallbackErr) {
                this.currentQuote = {
                    text: "The only way to do great work is to love what you do.",
                    author: "Steve Jobs"
                };
            }
        }

        // Render UI
        if (textEl && authorEl) {
            textEl.textContent = `"${this.currentQuote.text}"`;
            authorEl.textContent = `— ${this.currentQuote.author}`;
            textEl.style.opacity = '1';
        }

        historyManager.addLog('Random Quotes', `"${this.currentQuote.text}" — ${this.currentQuote.author}`);
    }

    playPageTurnSFX() {
        try {
            const ctx = soundMaster.getContext();
            const output = soundMaster.getOutputNode();

            // Simulate the sound of turning a page with gradually fading white noise
            const bufferSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(output);

            noise.start();
        } catch (e) {
            console.warn(e);
        }
    }
}