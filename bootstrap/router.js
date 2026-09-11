/**
 * RANS Router — Hash-based SPA Router with Dynamic Module Loading
 */

export class Router {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.routes = new Map();
        this.currentModule = null;
        
        // Default route
        this.defaultRoute = 'number';
    }

    /**
     * Khởi chạy Router & đăng ký Event Listener
     */
    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        // Trigger route lần đầu khi load trang
        this.handleRoute();
    }

    /**
     * Xử lý điều hướng khi Hash trên URL thay đổi
     */
    async handleRoute() {
        // Lấy route từ URL (ví dụ: #spinner -> spinner)
        let hash = window.location.hash.replace('#', '').trim();
        if (!hash) {
            hash = this.defaultRoute;
            window.location.hash = `#${this.defaultRoute}`;
            return;
        }

        // Cập nhật trạng thái Active trên Sidebar Nav
        this.updateActiveNav(hash);

        // Dynamic import module tương ứng từ engine/modules/
        try {
            const moduleExports = await import(`../engine/modules/${hash}.js`);
            const ModuleClass = moduleExports.default;

            // Xóa UI cũ trong workspace
            this.container.innerHTML = '';

            // Kiểm tra xem module export ra Class hay Object/Function thông thường
            if (typeof ModuleClass === 'function') {
                // Style OOP: Class có hàm render(container)
                const instance = new ModuleClass();
                instance.render(this.container);
            } else if (moduleExports.render && typeof moduleExports.render === 'function') {
                // Style Functional (dự phòng)
                this.container.innerHTML = moduleExports.render();
                if (moduleExports.init && typeof moduleExports.init === 'function') {
                    moduleExports.init();
                }
            }

            this.currentModule = hash;
        } catch (error) {
            console.error(`[RANS Router] Error loading module #${hash}:`, error);
            this.render404(hash);
        }
    }

    /**
     * Highlight icon đang active trên Sidebar
     */
    updateActiveNav(activeHash) {
        document.querySelectorAll('.nav-item').forEach(item => {
            const moduleName = item.getAttribute('data-module');
            if (moduleName === activeHash) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * UI dự phòng khi không tìm thấy module
     */
    render404(hash) {
        this.container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1rem;">
                <h2 style="font-size: 2rem; margin-bottom: 1rem; color: var(--accent);">Module Under Construction</h2>
                <p style="color: var(--text-muted);">Module <code>#${hash}</code> đang được phát triển hoặc chưa khởi tạo.</p>
            </div>
        `;
    }
}