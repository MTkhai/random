/* ==========================================================================
   ENGINE: HISTORY MANAGER
   ========================================================================== */

export class HistoryManager {
    constructor() {
        this.records = JSON.parse(localStorage.getItem('rans_history') || '[]');
        this.liveTimer = null;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target && e.target.closest('#btn-clear-history, .btn-clear-history, [data-action="clear-history"]')) {
                this.clear();
            }
        });
    }

    // Kiểm tra xem đã ghim Dynamic Clock chưa
    hasDynamicClock() {
        return this.records.some(r => r.isDynamic);
    }

    // Thêm Log (Đảm bảo Log Dynamic luôn được ghim lên đầu)
    addLog(moduleName, result, options = {}) {
        const record = {
            id: Date.now(),
            module: moduleName,
            result: result,
            timestamp: new Date().toLocaleTimeString(),
            isDynamic: options.isDynamic || false,
            timezone: options.timezone || null
        };

        if (record.isDynamic) {
            // Xóa dynamic clock cũ nếu có và đưa bản mới lên ĐẦU danh sách
            this.records = this.records.filter(r => !r.isDynamic);
            this.records.unshift(record);
        } else {
            // Các log thông thường sẽ được chèn bên dưới log Dynamic (nếu có)
            const dynamicItems = this.records.filter(r => r.isDynamic);
            const normalItems = this.records.filter(r => !r.isDynamic);
            normalItems.unshift(record);
            this.records = [...dynamicItems, ...normalItems];
        }

        this.save();
        this.render();
    }

    // Bỏ ghim Dynamic Clock khỏi History
    removeDynamicClock() {
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
            return;
        }

        // Đảm bảo item Dynamic luôn xếp đầu tiên trong mảng hiển thị
        const sortedRecords = [
            ...this.records.filter(r => r.isDynamic),
            ...this.records.filter(r => !r.isDynamic)
        ];

        const itemsHtml = sortedRecords.map(item => {
            // Badge PINNED & DYNAMIC cho đồng hồ chính
            const dynamicBadge = item.isDynamic ? `
                <span style="
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.4);
                    font-size: 0.65rem;
                    padding: 1px 6px;
                    border-radius: 4px;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                ">📌 PINNED DYNAMIC</span>
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
                <div style="
                    background: ${item.isDynamic ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.04)'};
                    border: 1px solid ${item.isDynamic ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'};
                    border-radius: 8px;
                    padding: 12px 14px;
                    font-size: 0.85rem;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                ">
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

        this.startLiveUpdate();
    }
}

export const historyManager = new HistoryManager();