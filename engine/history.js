/* ==========================================================================
   ENGINE: HISTORY MANAGER
   ========================================================================== */

export class HistoryManager {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('rans_history') || '[]');
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest('#btn-clear-history, .btn-clear-history, [data-action="clear-history"]')) {
                this.clear();
            }
        });
    }

    addLog(moduleName, result) {
        const record = {
            id: Date.now(),
            module: moduleName,
            result: result,
            timestamp: new Date().toLocaleTimeString()
        };

        this.records.unshift(record);
        this.save();
        this.render();
    }

    clear() {
        this.records = [];
        this.save();
        this.render();
    }

    save() {
        localStorage.setItem('rans_history', JSON.stringify(this.records));
    }

    render() {
        const container = document.getElementById('history-content') || document.querySelector('.history-drawer-body');
        if (!container) return;

        if (this.records.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted, #888);">No history records yet.</div>`;
            return;
        }

        // Render từng item thành thẻ Box riêng biệt
        const itemsHtml = this.records.map(item => `
            <div style="
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 8px;
                padding: 12px 14px;
                font-size: 0.85rem;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            ">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                    <strong style="color: var(--accent, #10b981); font-weight: 600;">${item.module}</strong>
                    <small style="color: #94a3b8; font-size: 0.75rem;">${item.timestamp}</small>
                </div>
                <div style="font-family: monospace; color: #f8fafc; word-break: break-all; line-height: 1.4;">
                    ${item.result}
                </div>
            </div>
        `).join('');

        // Đường gạch nét đứt (dashed) dày 2px ở ĐẦU và CUỐI
        const dashedBorder = `border-top: 2px dashed rgba(255, 255, 255, 0.25);`;

        container.innerHTML = `
            <div style="${dashedBorder} margin-bottom: 16px;"></div>
            
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${itemsHtml}
            </div>

            <div style="${dashedBorder} margin-top: 16px;"></div>
        `;
    }
}

export const historyManager = new HistoryManager();