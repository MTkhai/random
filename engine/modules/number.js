/**
 * RANS Module — Number Generator
 */

export function render() {
    return `
        <div class="card">
            <h2 style="margin-bottom: 1rem; color: var(--accent);">Random Number Generator</h2>
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                <div>
                    <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">Min</label>
                    <input type="number" id="num-min" value="1" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 6px; width: 100px;">
                </div>
                <div>
                    <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem;">Max</label>
                    <input type="number" id="num-max" value="100" style="background: var(--bg-surface-hover); border: 1px solid var(--border-color); color: var(--text-main); padding: 0.5rem; border-radius: 6px; width: 100px;">
                </div>
            </div>
            
            <button id="btn-gen-number" style="background: var(--accent); color: #000; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; cursor: pointer;">Generate Number</button>

            <div id="number-result" style="margin-top: 2rem; font-size: 4rem; font-family: var(--font-mono); font-weight: 700; color: var(--accent); text-align: center;">
                --
            </div>
        </div>
    `;
}

export function init() {
    const btn = document.getElementById('btn-gen-number');
    const result = document.getElementById('number-result');

    btn?.addEventListener('click', () => {
        const min = parseInt(document.getElementById('num-min').value) || 0;
        const max = parseInt(document.getElementById('num-max').value) || 100;
        
        // Tạm dùng Math.random trước khi cắm Entropy Engine vào
        const val = Math.floor(Math.random() * (max - min + 1)) + min;
        result.textContent = val;
    });
}