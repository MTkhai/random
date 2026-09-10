/**
 * RANS Engine — Multi-Source Entropy Mixing Engine
 * Combines CSPRNG, Audio Noise, User Behavior, Network Latency, and Weather API.
 * Uses SHA-256 to extract true cryptographic entropy.
 */

export class EntropyEngine {
    constructor() {
        this.pool = new Uint8Array(256); // Bể entropy 256-bit
        this.poolIndex = 0;
        this.audioContext = null;
        this.weatherData = null;
        this.pingLatency = 0;

        // Tự động thu thập nhiễu ngay khi tạo Engine
        this.initEntropySources();
    }

    /**
     * Khởi tạo & thu thập 5 nguồn nhiễu ngẫu nhiên
     */
    async initEntropySources() {
        // Source 1: CSPRNG (Cryptographically Secure PRNG)
        this.collectCSPRNG();

        // Source 2: User Mouse & Movement Behavior
        this.collectUserBehavior();

        // Source 3: Hardware Audio Context Noise
        this.collectAudioNoise();

        // Source 4: Network Latency (Encrypted Ping)
        this.collectNetworkLatency();

        // Source 5: Live Weather Data (Optional Async)
        this.collectWeatherData();
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

            // Chuyển đổi tọa độ & thời gian thành dữ liệu Byte
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

            // Thu nhiễu vi mô từ card âm thanh
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
    // 4. Network Latency (Encrypted DNS Ping)
    // --------------------------------------------------------------------------
    async collectNetworkLatency() {
        const start = performance.now();
        try {
            // Fetch nhẹ gói DNS Cloudflare để đo millisecond độ trễ mạng
            await fetch('https://1.1.1.1/cdn-cgi/trace', { mode: 'no-cors', cache: 'no-store' });
            this.pingLatency = performance.now() - start;

            const latencyBytes = new Float64Array([this.pingLatency]);
            this.mixIntoPool(new Uint8Array(latencyBytes.buffer));
        } catch (err) {
            // Offline Mode Fallback
            this.pingLatency = 0;
        }
    }

    // --------------------------------------------------------------------------
    // 5. Weather Data API (Optional)
    // --------------------------------------------------------------------------
    async collectWeatherData() {
        try {
            // Lấy thời tiết mặc định không cần API Key từ Open-Meteo
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
    // Core Functions: Pool Mixer & SHA-256 Digest
    // --------------------------------------------------------------------------
    mixIntoPool(byteArray) {
        for (let i = 0; i < byteArray.length; i++) {
            this.pool[this.poolIndex] ^= byteArray[i]; // Trộn bằng XOR
            this.poolIndex = (this.poolIndex + 1) % this.pool.length;
        }
    }

    /**
     * Băm Bể Entropy hiện tại qua SHA-256 và trả về mảng 32-byte True Random
     */
    async getSHA256Seed() {
        // Thu thập lại CSPRNG & High-Res Timestamp làm Salt trước mỗi lần Hash
        this.collectCSPRNG();
        this.mixIntoPool(new Uint8Array(new Float64Array([performance.now()]).buffer));

        // Crypto Subtle API SHA-256
        const hashBuffer = await crypto.subtle.digest('SHA-256', this.pool);
        return new Uint8Array(hashBuffer);
    }

    /**
     * Trích xuất số nguyên ngẫu nhiên trong khoảng [min, max]
     */
    async getRandomInt(min, max) {
        if (min >= max) return min;

        const seed = await this.getSHA256Seed();
        // Lấy 4 bytes đầu tiên biến thành số nguyên UInt32
        const view = new DataView(seed.buffer);
        const randomUInt32 = view.getUint32(0);

        const range = (max - min + 1);
        return min + (randomUInt32 % range);
    }

    /**
     * Trích xuất số thực ngẫu nhiên trong khoảng [0, 1)
     */
    async getRandomFloat() {
        const seed = await this.getSHA256Seed();
        const view = new DataView(seed.buffer);
        const randomUInt32 = view.getUint32(0);
        return randomUInt32 / (0xFFFFFFFF + 1);
    }
}

// Export một Instance Singleton duy nhất dùng cho toàn ứng dụng RANS
export const entropyEngine = new EntropyEngine();