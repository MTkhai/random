/* ==========================================================================
   ENGINE: HISTORY MANAGER
   ========================================================================== */

export class HistoryManager {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('rans_history') || '[]');
        this.container = null;
    }

    /**
     * Hàm ghi Log mới
     */
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
        // Tìm DOM chứa danh sách History trong Drawer
        const container = document.getElementById('history-content') || document.querySelector('.history-drawer-body');
        if (!container) return;

        if (this.records.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted, #888);">No history records yet.</div>`;
            return;
        }

        container.innerHTML = this.records.map(item => `
            <div style="padding: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.85rem;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 0.25rem;">
                    <strong style="color: var(--accent, #10b981);">${item.module}</strong>
                    <small style="opacity:0.6;">${item.timestamp}</small>
                </div>
                <div style="font-family: monospace; word-break: break-all;">${item.result}</div>
            </div>
        `).join('');
    }
}

// Export duy nhất 1 instance dùng chung cho toàn bộ App
export const historyManager = new HistoryManager();