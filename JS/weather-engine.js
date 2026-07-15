export async function getEnvironmentalEntropy() {
    // List 20 thành phố cố định (không bao giờ bị chặn/CORS)
    const cities = [
        { lat: 21.02, lon: 105.83 }, // Hanoi
        { lat: 48.85, lon: 2.35 },   // Paris
        { lat: 35.67, lon: 139.65 }, // Tokyo
        { lat: 40.71, lon: -74.00 }, // New York
        { lat: -33.86, lon: 151.20 },// Sydney
        { lat: 1.35, lon: 103.81 },  // Singapore
        { lat: 51.50, lon: -0.12 },  // London
        { lat: 37.56, lon: 126.97 }, // Seoul
        { lat: -23.55, lon: -46.63 },// Sao Paulo
        { lat: 39.90, lon: 116.40 }, // Beijing
        { lat: 19.43, lon: -99.13 }, // Mexico City
        { lat: 28.61, lon: 77.20 },  // New Delhi
        { lat: -6.20, lon: 106.84 }, // Jakarta
        { lat: 55.75, lon: 37.61 },  // Moscow
        { lat: 34.05, lon: -118.24 },// Los Angeles
        { lat: 43.65, lon: -79.38 }, // Toronto
        { lat: -34.60, lon: -58.38 },// Buenos Aires
        { lat: 52.36, lon: 4.90 },   // Amsterdam
        { lat: 45.42, lon: -75.69 }, // Ottawa
        { lat: 30.04, lon: 31.23 }   // Cairo
    ];

    // Random lấy 1 thành phố từ list
    const city = cities[Math.floor(Math.random() * cities.length)];

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,pressure_msl`;
        const res = await fetch(url);
        const data = await res.json();
        return data.current; 
    } catch (e) {
        return { ts: performance.now(), city: "fallback" };
    }
}