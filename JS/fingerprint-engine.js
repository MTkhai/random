/**
 * fingerprint-engine.js
 * Chỉ thu thập thông tin không cần quyền (permissionless)
 * để làm seed cho True Random Number Generator.
 */
export async function getFingerprintSeed() {
async function getFingerprintSeed() {
    // 1. Thu thập các thông số môi trường & thiết bị
    const components = [
        navigator.userAgent,          // Browser + OS info
        navigator.language,           // Locale
        navigator.hardwareConcurrency,// Số nhân CPU
        navigator.deviceMemory,       // RAM ước tính
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        `${screen.width}x${screen.height}`,
        screen.colorDepth,
        navigator.vendor,
        navigator.platform
    ];

    // 2. Thêm Canvas Fingerprint (vũ khí mạnh nhất)
    // Nó render ra pixel dựa trên driver đồ họa riêng biệt của từng máy
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 200; canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "14px 'Arial'";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("TrueRandomGenerator, <?>", 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText("TrueRandomGenerator, <?>", 4, 17);
    components.push(canvas.toDataURL());

    // 3. Băm toàn bộ dữ liệu này bằng SHA-256
    const rawData = components.join('|');
    const encoder = new TextEncoder();
    const data = encoder.encode(rawData);
    
    // Trả về hash dưới dạng ArrayBuffer (hoặc chuyển sang Hex tùy ý)
    return await crypto.subtle.digest('SHA-256', data);
}
}

