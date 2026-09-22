/**
 * RANS Engine — Multi-Source Entropy Mixing Engine
 * Combines CSPRNG, Audio Noise, User Behavior, Network Latency, Weather API, and GPU Canvas.
 * Uses SHA-256 to extract true cryptographic entropy.
 */

export class EntropyEngine {
    constructor(debug = true) {
        // Nâng cấp bể entropy từ 256-bit lên 512-bit (64 bytes)
        this.pool = new Uint8Array(64); 
        this.poolIndex = 0;
        this.audioContext = null;
        this.weatherData = null;
        this.pingLatency = 0;
        this.debug = debug;

        this.initEntropySources();
    }

    /**
     * Khởi tạo & thu thập 6 nguồn nhiễu ngẫu nhiên
     */
    async initEntropySources() {
        // Source 1: CSPRNG (Cryptographically Secure PRNG)
        this.collectCSPRNG();

        // Source 2: User Mouse & Movement Behavior
        this.collectUserBehavior();

        // Source 3: Hardware Audio Context Noise
        this.collectAudioNoise();

        // Source 4: Network Latency (Encrypted Ping v4/v6)
        this.collectNetworkLatency();

        // Source 5: Live Weather Data (Optional Async)
        this.collectWeatherData();

        // Source 6: GPU Canvas & WebGL Rendering Noise
        this.collectGPUEntropy();
    }

    // --------------------------------------------------------------------------
    // 1. CSPRNG (Cryptographically Secure PRNG)
    // --------------------------------------------------------------------------
    collectCSPRNG() {
        const csprngBytes = new Uint8Array(32);
        crypto.getRandomValues(csprngBytes);
        this.mixIntoPool(csprngBytes);
    }

    // --------------------------------------------------------------------------
    // 2. User Behavior (Mouse Position & Performance Timestamp)
    // --------------------------------------------------------------------------
    collectUserBehavior() {
        const handler = (e) => {
            const time = performance.now();
            const x = e.clientX || 0;
            const y = e.clientY || 0;

            const behaviorData = new Float64Array([x, y, time]);
            const bytes = new Uint8Array(behaviorData.buffer);

            this.mixIntoPool(bytes);
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
                
                oscillator.stop();
                ctx.close();
            }, 50);
        } catch (err) {
            // Fallback im lặng nếu trình duyệt chặn Autoplay Audio Context
        }
    }

    // --------------------------------------------------------------------------
    // 4. Encrypted DoH Multi-DNS Latency Ping (Fixed URLs & Headers)
    // --------------------------------------------------------------------------
    async collectNetworkLatency() {
        const dohQueryV4 = '?dns=AAABAAABAAAAAAAABm10a2hhaQZnaXRodWICaW8AAAEAAQ';
        const dohQueryV6 = '?dns=AAABAAABAAAAAAAABm10a2hhaQZnaXRodWICaW8AABwAAQ';

        const dnsEndpoints = [
            { name: 'Google (v4)', url: 'https://dns.google/dns-query' + dohQueryV4 },
            { name: 'Google (v6)', url: 'https://dns.google/dns-query' + dohQueryV6 },
            { name: 'Cloudflare (v4)', url: 'https://cloudflare-dns.com/dns-query' + dohQueryV4 },
            { name: 'Cloudflare (v6)', url: 'https://cloudflare-dns.com/dns-query' + dohQueryV6 },
            { name: 'NextDNS (v4)', url: 'https://dns.nextdns.io' + dohQueryV4 },
            { name: 'NextDNS (v6)', url: 'https://dns.nextdns.io' + dohQueryV6 },
            { name: 'Quad9 (v4)', url: 'https://dns11.quad9.net/dns-query' + dohQueryV4 },
            { name: 'Quad9 (v6)', url: 'https://dns11.quad9.net/dns-query' + dohQueryV6 },
            { name: 'Wikimedia (v4)', url: 'https://wikimedia-dns.org/dns-query' + dohQueryV4 },
            { name: 'Wikimedia (v6)', url: 'https://wikimedia-dns.org/dns-query' + dohQueryV6 },
            { name: 'Mullvad (v4)', url: 'https://dns.mullvad.net/dns-query' + dohQueryV4 },
            { name: 'Mullvad (v6)', url: 'https://dns.mullvad.net/dns-query' + dohQueryV6 }
        ];

        const latencyPromises = dnsEndpoints.map(async (item) => {
            const start = performance.now();
            try {
                await fetch(item.url, { 
                    method: 'GET',
                    mode: 'no-cors', 
                    cache: 'no-store'
                });
                return { name: item.name, latency: performance.now() - start };
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
                console.log('%c[EntropyEngine] 🌐 Source 4: Multi-DoH (v4/v6) DNS Latencies Mixed', 'color: #06b6d4;', {
                    avgPing: `${this.pingLatency.toFixed(2)}ms`,
                    nodesResponded: `${validResults.length}/${dnsEndpoints.length}`
                });
            }
        } else {
            this.pingLatency = 0;
        }
    }

    // --------------------------------------------------------------------------
    // 5. Weather Data API (Optional)
    // --------------------------------------------------------------------------
    async collectWeatherData() {
        try {
            const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=21.02&longitude=105.83&current_weather=true');
            const data = await res.json();
            if (data && data.current_weather) {
                const weatherVal = data.current_weather.temperature + data.current_weather.windspeed;
                const weatherBytes = new Float64Array([weatherVal]);
                this.mixIntoPool(new Uint8Array(weatherBytes.buffer));
            }
        } catch (err) {
            // Bỏ qua nếu offline hoặc API lỗi
        }
    }

    // --------------------------------------------------------------------------
    // 6. GPU Canvas & WebGL Rendering Noise (Hardware Graphics Jitter)
    // --------------------------------------------------------------------------
    collectGPUEntropy() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!ctx) return;

            const buffer = ctx.createBuffer();
            ctx.bindBuffer(ctx.ARRAY_BUFFER, buffer);
            
            const debugInfo = ctx.getExtension('WEBGL_debug_renderer_info');
            const rendererVendor = debugInfo ? ctx.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
            const rendererInfo = debugInfo ? ctx.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';

            const gpuString = rendererVendor + '_' + rendererInfo + '_' + performance.now();
            const encoder = new TextEncoder();
            const gpuBytes = encoder.encode(gpuString);

            this.mixIntoPool(gpuBytes);

            if (this.debug) {
                console.log('%c[EntropyEngine] 🎨 Source 6: GPU Hardware Noise Mixed', 'color: #14b8a6;', {
                    gpu: rendererInfo,
                    bytesMixed: gpuBytes.length
                });
            }
        } catch (err) {
            if (this.debug) console.warn('[EntropyEngine] GPU Canvas entropy skipped.');
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

    /**
     * Băm Bể Entropy hiện tại qua SHA-512 và trả về mảng 64-byte True Random (Gấp đôi đầu ra)
     */
    async getSHA512Seed() {
        this.collectCSPRNG();
        this.mixIntoPool(new Uint8Array(new Float64Array([performance.now()]).buffer));

        // Nâng cấp thuật toán băm từ SHA-256 lên SHA-512
        const hashBuffer = await crypto.subtle.digest('SHA-512', this.pool);
        return new Uint8Array(hashBuffer); // Trả về 64 bytes
    }

    /**
     * Trích xuất số nguyên ngẫu nhiên trong khoảng [min, max] (Dùng 64-bit seed mạnh hơn)
     */
    async getRandomInt(min, max) {
        if (min >= max) return min;

        const seed = await this.getSHA512Seed();
        const view = new DataView(seed.buffer);
        // Lấy 8 bytes đầu tiên (BigInt 64-bit) để chia khoảng rộng hơn nếu cần
        const randomBigInt = view.getBigUint64(0);

        const range = BigInt(max - min + 1);
        return min + Number(randomBigInt % range);
    }

    /**
     * Trích xuất số thực ngẫu nhiên trong khoảng [0, 1)
     */
    async getRandomFloat() {
        const seed = await this.getSHA512Seed();
        const view = new DataView(seed.buffer);
        // Dùng 53-bit đầu của seed SHA-512 để tạo độ chính xác số thực tối đa tiêu chuẩn IEEE 754
        const randomBigInt = view.getBigUint64(0) & 0x1FFFFFFFFFFFFFn;
        return Number(randomBigInt) / 9007199254740992.0;
    }
}


// Export Singleton Instance
export const entropyEngine = new EntropyEngine();
export default function initSpinner() {
    const spinner = new SpinnerModule();
    spinner.init();
}