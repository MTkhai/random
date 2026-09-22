import { Router } from './router.js';
import { historyManager } from '../engine/history.js';

class RansApp {
    constructor() {
        this.router = null;
        this.state = {
            theme: localStorage.getItem('rans_theme') || 'dark',
            sidebarPos: localStorage.getItem('rans_sidebar_pos') || 'left',
            sidebarCollapsed: localStorage.getItem('rans_sidebar_collapsed') === 'true',
            historyOpen: false
        };
    }

    init() {
        // 1. Áp dụng State
        this.applyTheme(this.state.theme);
        this.applySidebarPos(this.state.sidebarPos);
        this.applySidebarCollapsed(this.state.sidebarCollapsed);

        // 2. Gán sự kiện
        this.bindEvents();

        // 3. Khởi tạo History & Router
        // historyManager.init();
        this.router = new Router('module-container');
        this.router.init();

        // 4. ÉP RENDER ICON LUCIDE (Sửa lỗi mất Icon & Nút)
        this.initIcons();

        console.log('🚀 RANS App initialized successfully!');
    }

    initIcons() {
        const renderLucide = () => {
            if (window.lucide) {
                window.lucide.createIcons();
            } else {
                setTimeout(renderLucide, 50); // Thử lại nếu CDN load chậm
            }
        };
        renderLucide();
    }

    bindEvents() {
        const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
        btnToggleSidebar?.addEventListener('click', () => {
            this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
            this.applySidebarCollapsed(this.state.sidebarCollapsed);
        });

        const btnTheme = document.getElementById('btn-theme-toggle');
        btnTheme?.addEventListener('click', () => {
            this.state.theme = this.state.theme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.state.theme);
        });

        const btnPos = document.getElementById('btn-sidebar-pos');
        btnPos?.addEventListener('click', () => {
            this.state.sidebarPos = this.state.sidebarPos === 'left' ? 'right' : 'left';
            this.applySidebarPos(this.state.sidebarPos);
        });

        const btnHistory = document.getElementById('btn-history-toggle');
        const btnCloseHistory = document.getElementById('btn-close-history');
        const backdrop = document.getElementById('drawer-backdrop');

        const toggleHistory = (open) => {
            this.state.historyOpen = open;
            const drawer = document.getElementById('history-drawer');
            drawer?.classList.toggle('open', open);
            backdrop?.classList.toggle('open', open);
        };

        btnHistory?.addEventListener('click', () => toggleHistory(!this.state.historyOpen));
        btnCloseHistory?.addEventListener('click', () => toggleHistory(false));
        backdrop?.addEventListener('click', () => toggleHistory(false));

        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                btnToggleSidebar?.click();
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('rans_theme', theme);
    }

    applySidebarPos(pos) {
        document.documentElement.setAttribute('data-sidebar-pos', pos);
        localStorage.setItem('rans_sidebar_pos', pos);
    }

    applySidebarCollapsed(collapsed) {
        const sidebar = document.getElementById('sidebar');
        sidebar?.classList.toggle('collapsed', collapsed);
        localStorage.setItem('rans_sidebar_collapsed', collapsed);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new RansApp();
    app.init();
});

export function initShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Bỏ qua nếu người dùng đang nhập text trong input hoặc textarea
        const activeTag = document.activeElement.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || activeTag === 'SELECT') {
            if (e.key === 'Escape') document.activeElement.blur();
            return;
        }

        // Space / Enter: Trigger nút hành động chính của module hiện tại
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            const mainBtn = document.querySelector('.module-card .btn-primary, .module-card button[id*="gen"], .module-card button[id*="spin"]');
            mainBtn?.click();
        }

        // Ctrl + H: Toggle History Panel
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
            e.preventDefault();
            const historyDrawer = document.getElementById('history-drawer') || document.querySelector('.history-drawer');
            historyDrawer?.classList.toggle('active');
        }

        // Esc: Đóng History
        if (e.key === 'Escape') {
            const historyDrawer = document.getElementById('history-drawer') || document.querySelector('.history-drawer');
            historyDrawer?.classList.remove('active');
        }
    });
}
import { entropyEngine } from '../engine/entropy.js';

// ... các đoạn code khởi tạo khác của app ...

console.log('🚀 RANS App initialized successfully!');

// Kích hoạt thu thập & in Log Entropy ngay khi khởi chạy App
(async () => {
    console.log('%c[RANS] Checking Entropy Engine status...', 'color: #3b82f6; font-weight: bold;');
    
    // Yêu cầu sinh thử 1 hạt giống Seed SHA-256 để in toàn bộ log 5 nguồn nhiễu
    await entropyEngine.getSHA256Seed();
})();