/**
 * RANS Engine — History Manager
 * Handlers storing, rendering, and clearing global execution logs in LocalStorage.
 */

export class HistoryManager {
    constructor() {
        this.storageKey = 'rans_history_log';
        this.maxItems = 50; // Giới hạn lưu tối đa 50 kết quả gần nhất
    }

    /**
     * Lấy toàn bộ danh sách lịch sử từ LocalStorage
     */
    getHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('[RANS History] Error reading history:', e);
            return [];
        }
    }

    /**
     * Thêm một kết quả mới vào History
     * @param {string} moduleName - Tên module (VD: 'Number', 'Dice', 'Color')
     * @param {string|number} result - Kết quả sinh ra
     * @param {string} icon - Tên Lucide icon đại diện
     */
    add(moduleName, result, icon = 'dice-5') {
        const history = this.getHistory();
        
        const newItem = {
            id: Date.now(),
            module: moduleName,
            result: result,
            icon: icon,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        // Chèn vào đầu danh sách
        history.unshift(newItem);

        // Giới hạn maxItems
        if (history.length > this.maxItems) {
            history.pop();
        }

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(history));
            this.render(); // Re-render UI Drawer ngay sau khi thêm
        } catch (e) {
            console.error('[RANS History] Error saving history:', e);
        }
    }

    /**
     * Xóa sạch lịch sử
     */
    clear() {
        localStorage.removeItem(this.storageKey);
        this.render();
    }

    /**
     * Render danh sách lịch sử ra HTML ở Drawer
     */
    render() {
        const container = document.getElementById('history-content');
        if (!container) return;

        const history = this.getHistory();

        if (history.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted); font-size: 0.875rem;">
                    <p>No history records yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.map(item => `
            <div class="history-item" style="
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                padding: 0.75rem; 
                border-bottom: 1px solid var(--border-color);
                font-size: 0.85rem;
            ">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <i data-lucide="${item.icon}" style="width: 16px; height: 16px; color: var(--accent);"></i>
                    <div>
                        <div style="font-weight: 600; color: var(--text-main);">${item.module}</div>
                        <div style="font-family: var(--font-mono); color: var(--accent); font-weight: 700;">${item.result}</div>
                    </div>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${item.timestamp}</span>
            </div>
        `).join('');

        // Re-init Lucide Icons cho các icon trong History
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    /**
     * Khởi tạo listener cho nút Clear History
     */
    init() {
        const btnClear = document.getElementById('btn-clear-history');
        btnClear?.addEventListener('click', () => {
            if (confirm('Bro có chắc muốn xóa sạch toàn bộ lịch sử không?')) {
                this.clear();
            }
        });

        // Render ban đầu
        this.render();
    }
}

// Export Singleton Instance
export const historyManager = new HistoryManager();