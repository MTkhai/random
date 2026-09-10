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
        historyManager.init();
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