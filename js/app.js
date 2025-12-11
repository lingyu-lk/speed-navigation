// ==================== App Configuration ====================
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'nav-theme',
        FAVORITES: 'nav-favorites',
        HISTORY: 'nav-history',
        CUSTOM_SITES: 'nav-custom-sites',
        SEARCH_MODE: 'nav-search-mode',
        SEARCH_ENGINE: 'nav-search-engine'
    },
    MAX_HISTORY: 50,
    DEBOUNCE_DELAY: 300,
    SEARCH_ENGINES: {
        google: {
            name: 'Google',
            url: 'https://www.google.com/search?q='
        },
        bing: {
            name: 'Bing',
            url: 'https://www.bing.com/search?q='
        },
        baidu: {
            name: '百度',
            url: 'https://www.baidu.com/s?wd='
        },
        duckduckgo: {
            name: 'DuckDuckGo',
            url: 'https://duckduckgo.com/?q='
        }
    }
};

// ==================== Utility Functions ====================
class Utils {
    /**
     * Debounce function to limit rate of execution
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Convert Chinese characters to Pinyin for search
     */
    static toPinyin(text) {
        // Extended pinyin mapping - load from pinyin.js if available
        const pinyinMap = typeof PINYIN_MAP !== 'undefined' ? PINYIN_MAP : {
            '哔': 'bi', '哩': 'li', '网': 'wang', '易': 'yi', '云': 'yun',
            '音': 'yin', '乐': 'le', '知': 'zhi', '乎': 'hu', '微': 'wei',
            '博': 'bo', '淘': 'tao', '宝': 'bao', '京': 'jing', '东': 'dong',
            '天': 'tian', '猫': 'mao', '拼': 'pin', '多': 'duo', '斗': 'dou',
            '鱼': 'yu', '爱': 'ai', '奇': 'qi', '艺': 'yi', '小': 'xiao',
            '红': 'hong', '书': 'shu', '虎': 'hu', '嗅': 'xiu'
        };

        return text.split('').map(char => pinyinMap[char] || char).join('');
    }

    /**
     * Sanitize HTML to prevent XSS
     */
    static sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Format date for display
     */
    static formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }
}

// ==================== Storage Manager ====================
class StorageManager {
    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
}

// ==================== Theme Manager ====================
class ThemeManager {
    constructor() {
        this.themes = ['light', 'dark', 'cherry', 'ocean', 'forest', 'sunset'];
        this.themeNames = {
            light: '☀️ 明亮',
            dark: '🌙 暗黑',
            cherry: '🌸 樱花',
            ocean: '🌊 海洋',
            forest: '🌲 森林',
            sunset: '🌅 日落'
        };
        this.theme = StorageManager.get(CONFIG.STORAGE_KEYS.THEME) || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.theme);
        this.setupToggle();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        StorageManager.set(CONFIG.STORAGE_KEYS.THEME, theme);
        this.updateToggleButton();
    }

    toggle() {
        const currentIndex = this.themes.indexOf(this.theme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[nextIndex]);
    }

    updateToggleButton() {
        const button = document.querySelector('.theme-toggle');
        if (button) {
            button.textContent = this.themeNames[this.theme];
            button.setAttribute('aria-label', `当前主题: ${this.themeNames[this.theme]}`);
        }
    }

    setupToggle() {
        const button = document.querySelector('.theme-toggle');
        if (button) {
            button.addEventListener('click', () => this.toggle());
        }
    }
}

// ==================== Favorites Manager ====================
class FavoritesManager {
    constructor() {
        this.favorites = StorageManager.get(CONFIG.STORAGE_KEYS.FAVORITES) || [];
    }

    isFavorite(url) {
        return this.favorites.includes(url);
    }

    toggle(url) {
        const index = this.favorites.indexOf(url);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(url);
        }
        StorageManager.set(CONFIG.STORAGE_KEYS.FAVORITES, this.favorites);
        return this.isFavorite(url);
    }

    getAll() {
        return this.favorites;
    }
}

// ==================== History Manager ====================
class HistoryManager {
    constructor() {
        this.history = StorageManager.get(CONFIG.STORAGE_KEYS.HISTORY) || [];
    }

    add(site) {
        const entry = {
            ...site,
            timestamp: new Date().toISOString(),
            visits: this.getVisitCount(site.url) + 1
        };

        // Remove existing entry if present
        this.history = this.history.filter(item => item.url !== site.url);

        // Add to beginning
        this.history.unshift(entry);

        // Limit history size
        if (this.history.length > CONFIG.MAX_HISTORY) {
            this.history = this.history.slice(0, CONFIG.MAX_HISTORY);
        }

        StorageManager.set(CONFIG.STORAGE_KEYS.HISTORY, this.history);
    }

    getVisitCount(url) {
        const entry = this.history.find(item => item.url === url);
        return entry ? entry.visits : 0;
    }

    getAll() {
        return this.history;
    }

    clear() {
        this.history = [];
        StorageManager.set(CONFIG.STORAGE_KEYS.HISTORY, this.history);
    }
}

// ==================== Search Manager ====================
class SearchManager {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.searchModeToggle = document.getElementById('searchModeToggle');
        this.searchEngineSelect = document.getElementById('searchEngineSelect');
        this.searchBox = document.querySelector('.search-box');
        this.mode = StorageManager.get(CONFIG.STORAGE_KEYS.SEARCH_MODE) || 'local';
        this.engine = StorageManager.get(CONFIG.STORAGE_KEYS.SEARCH_ENGINE) || 'google';
        this.init();
    }

    init() {
        if (this.searchInput) {
            const debouncedSearch = Utils.debounce((e) => this.search(e.target.value), CONFIG.DEBOUNCE_DELAY);
            this.searchInput.addEventListener('input', debouncedSearch);
            this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        }

        if (this.searchModeToggle) {
            this.searchModeToggle.addEventListener('click', () => this.toggleMode());
        }

        if (this.searchEngineSelect) {
            this.searchEngineSelect.value = this.engine;
            this.searchEngineSelect.addEventListener('change', (e) => this.setEngine(e.target.value));
        }

        this.updateUI();
    }

    toggleMode() {
        this.mode = this.mode === 'local' ? 'engine' : 'local';
        StorageManager.set(CONFIG.STORAGE_KEYS.SEARCH_MODE, this.mode);
        this.updateUI();
    }

    setEngine(engine) {
        this.engine = engine;
        StorageManager.set(CONFIG.STORAGE_KEYS.SEARCH_ENGINE, engine);
    }

    updateUI() {
        if (this.mode === 'engine') {
            this.searchBox?.classList.add('engine-mode');
            this.searchModeToggle?.classList.add('engine-mode');
            this.searchInput.placeholder = `🌐 使用 ${CONFIG.SEARCH_ENGINES[this.engine].name} 搜索... (Enter)`;
        } else {
            this.searchBox?.classList.remove('engine-mode');
            this.searchModeToggle?.classList.remove('engine-mode');
            this.searchInput.placeholder = '🔍 搜索你想要的网站... (Ctrl+K)';
        }
    }

    handleKeydown(e) {
        if (e.key === 'Enter' && this.mode === 'engine') {
            e.preventDefault();
            const query = this.searchInput.value.trim();
            if (query) {
                const engineUrl = CONFIG.SEARCH_ENGINES[this.engine].url;
                window.open(engineUrl + encodeURIComponent(query), '_blank');
            }
        }
    }

    search(term) {
        // Only perform local search in local mode
        if (this.mode !== 'local') return;

        const searchTerm = term.toLowerCase();
        const searchPinyin = Utils.toPinyin(term.toLowerCase());

        // Get categories dynamically each time
        const categories = document.querySelectorAll('.category');

        categories.forEach(category => {
            let hasVisibleCards = false;
            const cards = category.querySelectorAll('.card');

            cards.forEach(card => {
                const title = card.querySelector('.card-title').textContent.toLowerCase();
                const desc = card.querySelector('.card-desc').textContent.toLowerCase();
                const tag = card.querySelector('.card-tag')?.textContent.toLowerCase() || '';

                const titlePinyin = Utils.toPinyin(title);
                const descPinyin = Utils.toPinyin(desc);

                const matches = title.includes(searchTerm) ||
                               desc.includes(searchTerm) ||
                               tag.includes(searchTerm) ||
                               titlePinyin.includes(searchPinyin) ||
                               descPinyin.includes(searchPinyin);

                if (matches) {
                    card.style.display = 'block';
                    hasVisibleCards = true;
                } else {
                    card.style.display = 'none';
                }
            });

            category.style.display = hasVisibleCards || searchTerm === '' ? 'block' : 'none';
        });

        // Update search results count
        this.updateSearchCount(searchTerm);
    }

    updateSearchCount(searchTerm) {
        if (!searchTerm) return;

        const visibleCards = document.querySelectorAll('.card[style="display: block;"]').length;
        console.log(`找到 ${visibleCards} 个相关网站`);
    }
}

// ==================== Navigation Manager ====================
class NavigationManager {
    constructor() {
        this.menuLinks = document.querySelectorAll('.sidebar-menu a');
        this.categories = document.querySelectorAll('.category');
        this.init();
    }

    init() {
        this.setupMenuClicks();
        this.setupScrollSpy();
    }

    setupMenuClicks() {
        this.menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();

                // Update active state
                this.menuLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Scroll to target
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }

                // Close mobile menu
                if (window.innerWidth <= 1024) {
                    document.getElementById('sidebar')?.classList.remove('mobile-show');
                }
            });
        });
    }

    setupScrollSpy() {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.updateActiveMenuItem();
                    this.updateBackToTopButton();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    updateActiveMenuItem() {
        const scrollPos = window.pageYOffset + 150;

        this.categories.forEach(category => {
            const top = category.offsetTop;
            const bottom = top + category.offsetHeight;
            const id = category.getAttribute('id');

            if (scrollPos >= top && scrollPos < bottom) {
                this.menuLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    updateBackToTopButton() {
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    }
}

// ==================== Site Renderer ====================
class SiteRenderer {
    constructor(favoritesManager, historyManager) {
        this.favoritesManager = favoritesManager;
        this.historyManager = historyManager;
    }

    async loadSites() {
        try {
            let data;

            // Try to use inline data first (for local file access)
            if (typeof SITES_DATA !== 'undefined') {
                data = SITES_DATA;
            } else {
                // Fallback to fetch (for server deployment)
                const response = await fetch('./data/sites.json');
                if (!response.ok) throw new Error('Failed to load sites data');
                data = await response.json();
            }

            this.renderCategories(data.categories);
            this.updateStats(data.categories);
            this.renderQuickAccess(data.categories);

            // Hide skeleton after loading
            this.hideSkeleton();
        } catch (error) {
            console.error('Error loading sites:', error);
            this.showError();
            this.hideSkeleton();
        }
    }

    hideSkeleton() {
        const skeleton = document.getElementById('loadingSkeleton');
        if (skeleton) {
            skeleton.classList.add('hidden');
        }
    }

    renderQuickAccess(categories) {
        const quickAccessContainer = document.getElementById('quickAccess');
        const quickAccessItems = document.getElementById('quickAccessItems');

        if (!quickAccessContainer || !quickAccessItems) return;

        // Get top 10 most visited sites from history
        const history = this.historyManager.getAll();

        if (history.length === 0) {
            quickAccessContainer.classList.add('empty');
            return;
        }

        // Sort by visits (descending) and take top 10
        const topSites = history
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 10);

        // Clear existing items
        quickAccessItems.innerHTML = '';

        // Render quick access items
        topSites.forEach(site => {
            const quickItem = this.createQuickAccessItem(site);
            quickAccessItems.appendChild(quickItem);
        });

        quickAccessContainer.classList.remove('empty');
    }

    createQuickAccessItem(site) {
        const item = document.createElement('a');
        item.href = site.url;
        item.className = 'quick-item';
        item.target = '_blank';
        item.rel = 'noopener noreferrer';

        // Extract domain for favicon
        let domain = '';
        try {
            const url = new URL(site.url);
            domain = url.hostname;
        } catch (e) {
            domain = site.url;
        }

        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        item.innerHTML = `
            <div class="quick-item-icon">
                <img src="${faviconUrl}" alt="${site.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${site.icon || '🌐'}</text></svg>'">
            </div>
            <div class="quick-item-name">${Utils.sanitizeHTML(site.name)}</div>
            <span class="quick-item-badge">${site.visits}</span>
        `;

        return item;
    }

    renderCategories(categories) {
        const content = document.querySelector('.content');
        if (!content) return;

        // Find stats element to preserve it
        const stats = content.querySelector('.stats');

        // Clear existing categories
        const existingCategories = content.querySelectorAll('.category');
        existingCategories.forEach(cat => cat.remove());

        categories.forEach(category => {
            const categoryEl = this.createCategoryElement(category);
            content.appendChild(categoryEl);
        });
    }

    createCategoryElement(category) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.id = category.id;

        const header = `
            <div class="category-header">
                <span class="category-icon">${category.icon}</span>
                <h2 class="category-title">${category.name}</h2>
                <span class="category-desc">${category.description}</span>
            </div>
        `;

        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards';

        category.sites.forEach(site => {
            const card = this.createCardElement(site);
            cardsDiv.appendChild(card);
        });

        categoryDiv.innerHTML = header;
        categoryDiv.appendChild(cardsDiv);

        return categoryDiv;
    }

    createCardElement(site) {
        const card = document.createElement('a');
        card.href = site.url;
        card.className = 'card';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.setAttribute('data-url', site.url);

        // Add favorite class if needed
        if (this.favoritesManager.isFavorite(site.url)) {
            card.classList.add('favorited');
        }

        const visits = this.historyManager.getVisitCount(site.url);
        const visitBadge = visits > 0 ? `<span class="visit-count" title="访问${visits}次">${visits}</span>` : '';

        // Extract domain for favicon
        let domain = '';
        try {
            const url = new URL(site.url);
            domain = url.hostname;
        } catch (e) {
            domain = site.url;
        }

        // Use real favicon with fallback to emoji
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        card.innerHTML = `
            <div class="card-icon-wrapper">
                <img class="card-favicon" src="${faviconUrl}" alt="${site.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="card-icon-fallback" style="display:none;">${site.icon}</div>
            </div>
            <div class="card-title">${Utils.sanitizeHTML(site.name)}</div>
            <div class="card-desc">${Utils.sanitizeHTML(site.description)}</div>
            <span class="card-tag">${Utils.sanitizeHTML(site.tag)}</span>
            ${visitBadge}
        `;

        // Add click handler for history
        card.addEventListener('click', (e) => {
            this.historyManager.add(site);
        });

        // Add context menu for favorite toggle
        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.toggleFavorite(card, site);
        });

        return card;
    }

    toggleFavorite(cardElement, site) {
        const isFavorited = this.favoritesManager.toggle(site.url);
        cardElement.classList.toggle('favorited', isFavorited);
    }

    updateStats(categories) {
        const totalSites = categories.reduce((sum, cat) => sum + cat.sites.length, 0);
        const totalCategories = categories.length;

        const totalSitesEl = document.getElementById('totalSites');
        if (totalSitesEl) {
            totalSitesEl.textContent = totalSites + '+';
        }

        // Update category count in stats
        const statItems = document.querySelectorAll('.stat-item');
        if (statItems[1]) {
            statItems[1].querySelector('.stat-number').textContent = totalCategories;
        }
    }

    showError() {
        const content = document.querySelector('.content');
        if (content) {
            content.innerHTML = `
                <div class="category">
                    <div class="category-header">
                        <h2 class="category-title">⚠️ 加载失败</h2>
                    </div>
                    <p>无法加载网站数据，请刷新页面重试。</p>
                </div>
            `;
        }
    }
}

// ==================== Mobile Menu Manager ====================
class MobileMenuManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.setupToggle();
    }

    setupToggle() {
        window.toggleSidebar = () => {
            this.sidebar?.classList.toggle('mobile-show');
        };
    }
}

// ==================== Scroll to Top ====================
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== Keyboard Navigation ====================
class KeyboardNavigationManager {
    constructor() {
        this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search focus
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('searchInput')?.focus();
            }

            // Escape to clear search
            if (e.key === 'Escape') {
                const searchInput = document.getElementById('searchInput');
                if (searchInput && searchInput.value) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                }
            }

            // Ctrl/Cmd + D for theme toggle
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                app.themeManager.toggle();
            }
        });
    }
}

// ==================== Main Application ====================
class App {
    constructor() {
        this.themeManager = new ThemeManager();
        this.favoritesManager = new FavoritesManager();
        this.historyManager = new HistoryManager();
        this.siteRenderer = new SiteRenderer(this.favoritesManager, this.historyManager);
        this.searchManager = new SearchManager();
        this.navigationManager = new NavigationManager();
        this.mobileMenuManager = new MobileMenuManager();
        this.keyboardNavigationManager = new KeyboardNavigationManager();
    }

    async init() {
        try {
            await this.siteRenderer.loadSites();
            this.setupServiceWorker();
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                // Service worker can be added here for PWA support
            });
        }
    }
}

// ==================== Initialize Application ====================
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    app.init();
});

// Make scrollToTop available globally
window.scrollToTop = scrollToTop;
