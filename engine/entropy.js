/**
 * RANS Engine — Multi-Source Entropy Mixing Engine
 * Combines CSPRNG, Audio Noise, User Behavior, Encrypted DoH DNS Latency, and Weather API.
 * Uses SHA-256 to extract true cryptographic entropy.
 */

export class EntropyEngine {
    constructor(debug = true) {
        this.pool = new Uint8Array(256); // Bể entropy 256-bit
        this.poolIndex = 0;
        this.audioContext = null;
        this.weatherData = null;
        this.pingLatency = 0;
        this.debug = debug; // Bật / Tắt Debug Console

        if (this.debug) {
            console.log('%c[EntropyEngine] 🚀 Engine started with Multi-Source Entropy mixing enabled', 'color: #10b981; font-weight: bold;');
        }

        // Tự động thu thập nhiễu ngay khi tạo Engine
        this.initEntropySources();
    }

    /**
     * Khởi tạo & thu thập 5 nguồn nhiễu ngẫu nhiên
     */
    async initEntropySources() {
        this.collectCSPRNG();
        this.collectUserBehavior();
        this.collectAudioNoise();
        this.collectNetworkLatency();
        this.collectWeatherData();
    }

    // --------------------------------------------------------------------------
    // 1. CSPRNG (Cryptographically Secure PRNG)
    // --------------------------------------------------------------------------
    collectCSPRNG() {
        const csprngBytes = new Uint8Array(32);
        crypto.getRandomValues(csprngBytes);
        this.mixIntoPool(csprngBytes);

        if (this.debug) {
            console.log('%c[EntropyEngine] 🎲 Source 1: CSPRNG Bytes Mixed', 'color: #3b82f6;', csprngBytes.slice(0, 8));
        }
    }

    // --------------------------------------------------------------------------
    // 2. User Behavior (Mouse Position & Performance Timestamp)
    // --------------------------------------------------------------------------
    collectUserBehavior() {
        let eventCount = 0;
        const handler = (e) => {
            const time = performance.now();
            const x = e.clientX || 0;
            const y = e.clientY || 0;

            const behaviorData = new Float64Array([x, y, time]);
            const bytes = new Uint8Array(behaviorData.buffer);

            this.mixIntoPool(bytes);
            eventCount++;

            // Throttling: Chỉ log mỗi 20 sự kiện để không làm lag Console
            if (this.debug && eventCount % 20 === 0) {
                console.log(`%c[EntropyEngine] 🖱️ Source 2: User Motion Mixed (x:${x}, y:${y}, t:${time.toFixed(2)}ms)`, 'color: #8b5cf6;');
            }
        };

        window.addEventListener('mousemove', handler, { passive: true });
        window.addEventListener('click', handler, { passive: true });
    }

    // --------------------------------------------------------------------------
    // 3. Audio Context Noise (Hardware DSP Floating Differences)
    // --------------------------------------------------------------------------
    async collectAudioNoise() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            const ctx = new AudioCtx();
            const oscillator = ctx.createOscillator();
            const compressor = ctx.createDynamicsCompressor();

            oscillator.type = 'triangle';
            oscillator.frequency.value = 10000;

            oscillator.connect(compressor);
            compressor.connect(ctx.destination);

            oscillator.start(0);

            setTimeout(() => {
                const noiseData = new Float32Array([
                    compressor.reduction,
                    ctx.currentTime,
                    performance.now()
                ]);
                this.mixIntoPool(new Uint8Array(noiseData.buffer));

                if (this.debug) {
                    console.log('%c[EntropyEngine] 🔊 Source 3: Audio Noise Mixed', 'color: #f59e0b;', {
                        reduction: compressor.reduction,
                        currentTime: ctx.currentTime
                    });
                }

                oscillator.stop();
                ctx.close();
            }, 50);
        } catch (err) {
            if (this.debug) console.warn('[EntropyEngine] Audio Context blocked or unsupported.');
        }
    }

    // --------------------------------------------------------------------------
    // 4. Encrypted DoH Multi-DNS Latency Ping
    // --------------------------------------------------------------------------
    async collectNetworkLatency() {
        const dnsEndpoints = [
            'https://dns.google/dns-query',
            'https://cloudflare-dns.com/dns-query',
            'https://dns.nextdns.io',
            'https://dns11.quad9.net',
            'https://wikimedia-dns.org',
            'https://dns.mullvad.net'
        ];

        const latencyPromises = dnsEndpoints.map(async (url) => {
            const start = performance.now();
            try {
                await fetch(url, { mode: 'no-cors', cache: 'no-store' });
                return { url, latency: performance.now() - start };
            } catch (err) {
                return null;
            }
        });

        const results = await Promise.allSettled(latencyPromises);
        const validResults = [];

        results.forEach((res) => {
            if (res.status === 'fulfilled' && res.value !== null) {
                validResults.push(res.value);
            }
        });

        if (validResults.length > 0) {
            const latencies = validResults.map(r => r.latency);
            this.pingLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;

            const latencyBytes = new Float64Array(latencies);
            this.mixIntoPool(new Uint8Array(latencyBytes.buffer));

            if (this.debug) {
                console.log('%c[EntropyEngine] 🌐 Source 4: Multi-DoH DNS Latencies Mixed', 'color: #06b6d4;', {
                    avgPing: `${this.pingLatency.toFixed(2)}ms`,
                    nodesResponded: `${validResults.length}/${dnsEndpoints.length}`,
                    details: validResults
                });
            }
        } else {
            this.pingLatency = 0;
        }
    }

    // --------------------------------------------------------------------------
    // 5. Weather Data API
    // --------------------------------------------------------------------------
    async collectWeatherData() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.02&longitude=105.83&current_weather=true');
            const data = await res.json();
            if (data && data.current_weather) {
                const weatherVal = data.current_weather.temperature + data.current_weather.windspeed;
                const weatherBytes = new Float64Array([weatherVal]);
                this.mixIntoPool(new Uint8Array(weatherBytes.buffer));

                if (this.debug) {
                    console.log('%c[EntropyEngine] 🌤️ Source 5: Live Weather Data Mixed', 'color: #ec4899;', data.current_weather);
                }
            }
        } catch (err) {
            if (this.debug) console.warn('[EntropyEngine] Weather API offline or unreachable.');
        }
    }

    // --------------------------------------------------------------------------
    // Core Functions: Pool Mixer & SHA-256 Digest
    // --------------------------------------------------------------------------
    mixIntoPool(byteArray) {
        for (let i = 0; i < byteArray.length; i++) {
            this.pool[this.poolIndex] ^= byteArray[i];
            this.poolIndex = (this.poolIndex + 1) % this.pool.length;
        }
    }

    toHex(uint8Array) {
        return Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async getSHA256Seed() {
        this.collectCSPRNG();
        this.mixIntoPool(new Uint8Array(new Float64Array([performance.now()]).buffer));

        const hashBuffer = await crypto.subtle.digest('SHA-256', this.pool);
        const seedBytes = new Uint8Array(hashBuffer);

        if (this.debug) {
            console.groupCollapsed('%c[EntropyEngine] 🔑 SHA-256 Seed Generated', 'color: #10b981; font-weight: bold;');
            console.log('Pool Sample (Hex):', this.toHex(this.pool.slice(0, 16)) + '...');
            console.log('SHA-256 Seed (Hex):', this.toHex(seedBytes));
            console.groupEnd();
        }

        return seedBytes;
    }

    async getRandomInt(min, max) {
        if (min >= max) return min;

        const seed = await this.getSHA256Seed();
        const view = new DataView(seed.buffer);
        const randomUInt32 = view.getUint32(0);

        const range = (max - min + 1);
        const result = min + (randomUInt32 % range);

        if (this.debug) {
            console.log(`%c[EntropyEngine] 🎲 Random Int [${min}, ${max}]: %c${result}`, 'color: #9333ea;', 'color: #10b981; font-weight: bold;');
        }

        return result;
    }

    async getRandomFloat() {
        const seed = await this.getSHA256Seed();
        const view = new DataView(seed.buffer);
        const randomUInt32 = view.getUint32(0);
        const result = randomUInt32 / (0xFFFFFFFF + 1);

        if (this.debug) {
            console.log(`%c[EntropyEngine] 🎲 Random Float [0, 1): %c${result}`, 'color: #9333ea;', 'color: #10b981; font-weight: bold;');
        }

        return result;
    }
}

// Export Instance mặc định với debug = true
export const entropyEngine = new EntropyEngine(true);