// 1. Cấu hình & Helper
const DNS_MESSAGE_HEADERS = { 'Accept': 'application/dns-message' };

// Hàm mã hóa DNS Query theo chuẩn DoH
function encodeDnsQueryBase64Url(query) {
    const binary = Array.from(query, byte => String.fromCharCode(byte)).join('');
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Tạo DNS Query thô
function buildDNSQuery(hostname) {
    const header = new Uint8Array(12);
    crypto.getRandomValues(header.subarray(0, 2));
    header[2] = 0x01; header[5] = 0x01;
    const labels = hostname.split('.');
    const qnameParts = [];
    labels.forEach(label => {
        const bytes = Array.from(label).map(char => char.charCodeAt(0));
        qnameParts.push(bytes.length, ...bytes);
    });
    const qname = new Uint8Array(qnameParts.length + 1);
    qname.set(qnameParts);
    const typeAndClass = new Uint8Array([0x00, 0x01, 0x00, 0x01]);
    const query = new Uint8Array(header.length + qname.length + typeAndClass.length);
    let offset = 0;
    query.set(header, offset); offset += header.length;
    query.set(qname, offset); offset += qname.length;
    query.set(typeAndClass, offset);
    return query;
}

// 2. Bộ máy đo
export async function measureLatency(dohUrl, hostname = 'github.com') {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout 3s

    try {
        const dnsQuery = buildDNSQuery(hostname);
        const urlWithParam = new URL(dohUrl);
        urlWithParam.searchParams.set('dns', encodeDnsQueryBase64Url(dnsQuery));
        
        const startTime = performance.now();
        // Dùng 'no-cors' để bypass và đo latency thực tế từ trình duyệt
        await fetch(urlWithParam, { method: 'GET', mode: 'no-cors', signal: controller.signal });
        const latency = performance.now() - startTime;
        
        clearTimeout(timeoutId);
        return latency;
    } catch (e) {
        clearTimeout(timeoutId);
        return null; // Trả về null nếu lỗi hoặc timeout
    }
}
// danh sách seed
export const myDNSProviders = [
    { name: "Google", url: "https://dns.google/resolve", type: "get", allowCors: true },
    { name: "Cloudflare", url: "https://cloudflare-dns.com/dns-query", type: "get", allowCors: true },
    { name: "AdGuard", url: "https://dns.adguard-dns.com/dns-query", type: "post", allowCors: false },
    { name: "OpenDNS", url: "https://doh.opendns.com/dns-query", type: "post", allowCors: false },
    { name: "Quad9", url: "https://dns.quad9.net/dns-query", type: "post", allowCors: false },
    { name: "ControlD", url: "https://freedns.controld.com/p0", type: "post", allowCors: false },
    { name: "DNS.SB", url: "https://doh.dns.sb/dns-query", type: "get", allowCors: true },
    { name: "Mullvad", url: "https://dns.mullvad.net/dns-query", type: "get", allowCors: false },
    { name: "NextDNS", url: "https://dns.nextdns.io", type: "get", allowCors: false },
    { name: "CleanBrowsing", url: "https://doh.cleanbrowsing.org/doh/family-filter/", type: "post", allowCors: false },
    { name: "AliDNS", url: "https://dns.alidns.com/dns-query", type: "post", allowCors: false },
    { name: "IIJ", url: "https://public.dns.iij.jp/dns-query", type: "post", allowCors: false },
    { name: "Switch", url: "https://dns.switch.ch/dns-query", type: "post", allowCors: false },
    { name: "LibreDNS", url: "https://doh.libredns.gr/dns-query", type: "post", allowCors: false },
    { name: "UncensoredDNS", url: "https://anycast.uncensoreddns.org/dns-query", type: "post", allowCors: false }
];

export async function getDNSJitter() {
    const latencies = await Promise.all(myDNSProviders.map(provider => measureLatency(provider.url)));
    // Lọc bỏ null, lấy mảng số để trộn vào Entropy Pool
    return latencies.filter(l => l !== null);
}