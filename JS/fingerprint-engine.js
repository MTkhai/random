/**
 * fingerprint-engine.js
 * Chỉ thu thập thông tin không cần quyền (permissionless)
 * để làm seed cho True Random Number Generator.
 */
export async function getFingerprintSeed() {
    const components = [
        navigator.userAgent,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        `${screen.width}x${screen.height}`
    ];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillText("entropy", 10, 10);
    components.push(canvas.toDataURL());
    
    const data = new TextEncoder().encode(components.join('|'));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return new Uint8Array(hash); // Trả về mảng byte để Mixer dùng
}