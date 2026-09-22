/* ==========================================================================
   ENGINE: HISTORY MANAGER (With Export Functionality)
   ========================================================================== */

export class HistoryManager {
    constructor() {
        this.records = [];
        this.liveTimer = null;
        this.refresh();
        this.openPanel();
        this.bindEvents();
    }

    refresh() {
        this.records = JSON.parse(localStorage.getItem('rans_history') || '[]');
        this.render();
    }

    openPanel() {
        const drawer = document.getElementById('history-drawer') || 
                       document.querySelector('.history-drawer') || 
                       document.querySelector('.history-panel');
        if (drawer) drawer.classList.add('active', 'open', 'show', 'is-open');
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest('#btn-clear-history, .btn-clear-history, [data-action="clear-history"]')) {
                this.clear();
            }
            if (e.target && e.target.closest('#btn-export-json')) {
                this.exportJSON();
            }
            if (e.target && e.target.closest('#btn-export-csv')) {
                this.exportCSV();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') this.refresh();
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'rans_history') this.refresh();
        });
    }

    exportJSON() {
        if (this.records.length === 0) return alert('No history records to export!');
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.records, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `rans_history_${Date.now()}.json`;
        a.click();
        a.remove();
    }

    exportCSV() {
        if (this.records.length === 0) return alert('No history records to export!');
        const headers = ["ID", "Module", "Result", "Timestamp", "IsDynamic"];
        const rows = this.records.map(r => [
            r.id,
            `"${r.module}"`,
            `"${(r.result || '').replace(/"/g, '""')}"`,
            `"${r.timestamp}"`,
            r.isDynamic ? "Yes" : "No"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const a = document.createElement('a');
        a.href = encodeURI(csvContent);
        a.download = `rans_history_${Date.now()}.csv`;
        a.click();
        a.remove();
    }

    hasDynamicClock() {
        return this.records.some(r => r.isDynamic);
    }

    addLog(moduleName, result, options = {}) {
        this.records = JSON.parse(localStorage.getItem('rans_history') || '[]');
        const record = {
            id: Date.now(),
            module: moduleName,
            result: result,
            timestamp: new Date().toLocaleTimeString(),
            isDynamic: options.isDynamic || false,
            timezone: options.timezone || null
        };

        if (record.isDynamic) {
            this.records = this.records.filter(r => !r.isDynamic);
            this.records.unshift(record);
        } else {
            const dynamicItems = this.records.filter(r => r.isDynamic);
            const normalItems = this.records.filter(r => !r.isDynamic);
            normalItems.unshift(record);
            this.records = [...dynamicItems, ...normalItems];
        }

        this.save();
        this.render();
    }

    removeDynamicClock() {
        this.records = JSON.parse(localStorage.getItem('rans_history') || '[]');
        this.records = this.records.filter(r => !r.isDynamic);
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

    startLiveUpdate() {
        if (this.liveTimer) clearInterval(this.liveTimer);
        this.liveTimer = setInterval(() => {
            const dynamicEls = document.querySelectorAll('.history-dynamic-clock');
            if (dynamicEls.length === 0) return;
            const now = new Date();
            dynamicEls.forEach(el => {
                const zone = el.getAttribute('data-zone');
                try {
                    const opts = (zone && zone !== 'local') ? { timeZone: zone } : {};
                    el.textContent = now.toLocaleTimeString('en-US', opts);
                } catch (e) {
                    el.textContent = now.toLocaleTimeString('en-US');
                }
            });
        }, 1000);
    }

    render() {
        const container = document.getElementById('history-content') || document.querySelector('.history-drawer-body');
        if (!container) return;

        if (this.records.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-muted, #888);">No history records yet.</div>`;
            this.renderFooterButtons();
            return;
        }

        const sortedRecords = [
            ...this.records.filter(r => r.isDynamic),
            ...this.records.filter(r => !r.isDynamic)
        ];

        const itemsHtml = sortedRecords.map(item => {
            const dynamicBadge = item.isDynamic ? `
                <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 0.65rem; padding: 1px 6px; border-radius: 4px; font-weight: 700; display: inline-flex; align-items: center; gap: 3px;">📌 PINNED DYNAMIC</span>
            ` : '';

            let contentHtml = item.result;
            if (item.isDynamic) {
                const initialTime = new Date().toLocaleTimeString('en-US');
                contentHtml = `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #cbd5e1; font-weight: 500;">Main Local Clock:</span>
                        <span class="history-dynamic-clock" data-zone="${item.timezone || 'local'}" style="font-family: monospace; font-size: 1.05rem; color: #10b981; font-weight: 700;">
                            ${initialTime}
                        </span>
                    </div>
                `;
            }

            return `
                <div style="background: ${item.isDynamic ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${item.isDynamic ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: 8px; padding: 12px 14px; font-size: 0.85rem; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <strong style="color: var(--accent, #10b981); font-weight: 600;">${item.module}</strong>
                            ${dynamicBadge}
                        </div>
                        <small style="color: #94a3b8; font-size: 0.75rem;">${item.timestamp}</small>
                    </div>
                    <div style="color: #f8fafc; word-break: break-all; line-height: 1.4;">
                        ${contentHtml}
                    </div>
                </div>
            `;
        }).join('');

        const dashedBorder = `border-top: 2px dashed rgba(255, 255, 255, 0.25);`;

        container.innerHTML = `
            <div style="${dashedBorder} margin-bottom: 16px;"></div>
            <div style="display: flex; flex-direction: column; gap: 16px;">
                ${itemsHtml}
            </div>
            <div style="${dashedBorder} margin-top: 16px;"></div>
        `;

        this.renderFooterButtons();
        this.startLiveUpdate();
    }

    // Hiển thị cụm nút Clear + Export JSON + Export CSV ở footer
    renderFooterButtons() {
        const drawer = document.getElementById('history-drawer') || 
                       document.querySelector('.history-drawer') || 
                       document.querySelector('.history-panel');
        if (!drawer) return;

        // Tìm hoặc tự động tạo mới footer nằm gọn trong drawer
        let footer = drawer.querySelector('.history-drawer-footer') || drawer.querySelector('footer');
        if (!footer) {
            footer = document.createElement('div');
            footer.className = 'history-drawer-footer';
            drawer.appendChild(footer);
        }

        footer.innerHTML = `
            <div style="display: flex; gap: 8px; padding: 12px; width: 100%; box-sizing: border-box; border-top: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.2);">
                <button id="btn-export-json" style="flex: 1; background: rgba(59, 130, 246, 0.15); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 6px; padding: 8px; font-size: 0.8em; cursor: pointer;">📥 JSON</button>
                <button id="btn-export-csv" style="flex: 1; background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; padding: 8px; font-size: 0.8em; cursor: pointer;">📊 CSV</button>
                <button id="btn-clear-history" style="flex: 1; background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; padding: 8px; font-size: 0.8em; cursor: pointer;">🗑️ Clear</button>
            </div>
        `;
    }
}

export const historyManager = new HistoryManager();