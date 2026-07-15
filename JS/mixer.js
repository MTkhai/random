/**
 * mixer.js
 * Kết hợp 3 nguồn: DNS, Fingerprint, Weather
 * Trả ra một số ngẫu nhiên trong khoảng [min, max]
 */
import { getDNSJitter } from './dns-engine.js';
import { getFingerprintSeed } from './fingerprint-engine.js';
import { getEnvironmentalEntropy } from './weather-engine.js';
import { myDNSProviders } from './dns-engine.js';
import { measureLatency } from './dns-engine.js';

export async function getTrulyRandomNumber(min, max) {
    const [dns, fp, env] = await Promise.all([
        Promise.all(myDNSProviders.map(p => measureLatency(p.url))),
        getFingerprintSeed(),
        getEnvironmentalEntropy()
    ]);
    
    const entropyPool = { dns, fp: Array.from(new Uint8Array(fp)), env, time: performance.now() };
    

    const data = JSON.stringify(entropyPool);
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    
    return (new Uint32Array(hash)[0] % (max - min + 1)) + min;
}