// ==================== App Configuration ====================
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'nav-theme',
        FAVORITES: 'nav-favorites',
        HISTORY: 'nav-history',
        RATINGS: 'nav-ratings',
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
        // Add transitioning class for smooth theme change
        document.documentElement.classList.add('theme-transitioning');

        document.documentElement.setAttribute('data-theme', theme);
        this.theme = theme;
        StorageManager.set(CONFIG.STORAGE_KEYS.THEME, theme);
        this.updateToggleButton();
        this.updateActiveThemeOption();

        // Remove transitioning class after animation
        setTimeout(() => {
            document.documentElement.classList.remove('theme-transitioning');
        }, 300);
    }

    toggle() {
        const currentIndex = this.themes.indexOf(this.theme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[nextIndex]);
    }

    updateToggleButton() {
        const button = document.querySelector('.theme-toggle');
        if (button) {
            const buttonText = button.querySelector('.theme-toggle-text');
            if (buttonText) {
                buttonText.textContent = this.themeNames[this.theme];
            }
            button.setAttribute('aria-label', `当前主题: ${this.themeNames[this.theme]}`);
        }
    }

    updateActiveThemeOption() {
        const dropdown = document.querySelector('.theme-dropdown');
        if (!dropdown) return;

        // Remove active class from all options
        dropdown.querySelectorAll('.theme-option').forEach(option => {
            option.classList.remove('active');
        });

        // Add active class to current theme
        const activeOption = dropdown.querySelector(`.theme-option[data-theme="${this.theme}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }

    setupToggle() {
        const button = document.querySelector('.theme-toggle');
        const dropdown = document.querySelector('.theme-dropdown');

        if (!button || !dropdown) return;

        // 点击按钮切换下拉菜单
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });

        // 点击主题选项
        dropdown.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.applyTheme(theme);
                dropdown.classList.remove('show');
            });
        });

        // 点击外部关闭下拉菜单
        document.addEventListener('click', (e) => {
            if (!button.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
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
        this.searchBtn = document.getElementById('searchBtn');
        this.searchEngineSelector = document.getElementById('searchEngineSelector');
        this.currentEngineEl = document.getElementById('currentEngine');
        this.currentEngineIconEl = document.getElementById('currentEngineIcon');
        this.searchDropdown = document.getElementById('searchDropdown');

        // Force default to local search for all users
        const storedEngine = StorageManager.get(CONFIG.STORAGE_KEYS.SEARCH_ENGINE);
        if (!storedEngine) {
            StorageManager.set(CONFIG.STORAGE_KEYS.SEARCH_ENGINE, 'local');
        }
        this.currentEngine = StorageManager.get(CONFIG.STORAGE_KEYS.SEARCH_ENGINE) || 'local';

        this.engineNames = {
            local: '站内',
            google: 'Google',
            bing: 'Bing',
            baidu: '百度',
            duckduckgo: 'DuckDuckGo'
        };
        this.engineIcons = {
            local: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>',
            google: '<img src="https://www.google.com/favicon.ico" alt="Google" width="16" height="16">',
            bing: '<img src="https://www.bing.com/favicon.ico" alt="Bing" width="16" height="16">',
            baidu: '<img src="https://www.baidu.com/favicon.ico" alt="百度" width="16" height="16">',
            duckduckgo: '<img src="https://duckduckgo.com/favicon.ico" alt="DuckDuckGo" width="16" height="16">'
        };
        this.init();
    }

    init() {
        if (this.searchInput) {
            const debouncedSearch = Utils.debounce((e) => this.search(e.target.value), CONFIG.DEBOUNCE_DELAY);
            this.searchInput.addEventListener('input', debouncedSearch);
            this.searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
        }

        if (this.searchEngineSelector) {
            this.searchEngineSelector.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.executeSearch());
        }

        if (this.searchDropdown) {
            const options = this.searchDropdown.querySelectorAll('.search-option');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    const engine = option.dataset.engine;
                    this.setEngine(engine);
                    this.closeDropdown();
                });
            });
        }

        document.addEventListener('click', () => this.closeDropdown());

        this.updateUI();
    }

    toggleDropdown() {
        this.searchDropdown?.classList.toggle('active');
        this.searchEngineSelector?.classList.toggle('active');
    }

    closeDropdown() {
        this.searchDropdown?.classList.remove('active');
        this.searchEngineSelector?.classList.remove('active');
    }

    setEngine(engine) {
        this.currentEngine = engine;
        StorageManager.set(CONFIG.STORAGE_KEYS.SEARCH_ENGINE, engine);
        this.updateUI();
    }

    updateUI() {
        if (this.currentEngineEl) {
            this.currentEngineEl.textContent = this.engineNames[this.currentEngine];
        }

        if (this.currentEngineIconEl) {
            this.currentEngineIconEl.innerHTML = this.engineIcons[this.currentEngine];
        }

        const options = this.searchDropdown?.querySelectorAll('.search-option');
        options?.forEach(option => {
            if (option.dataset.engine === this.currentEngine) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    handleKeydown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.executeSearch();
        }
    }

    executeSearch() {
        const query = this.searchInput.value.trim();
        if (!query) return;

        if (this.currentEngine === 'local') {
            this.search(query);
        } else {
            const engineUrl = CONFIG.SEARCH_ENGINES[this.currentEngine].url;
            window.open(engineUrl + encodeURIComponent(query), '_blank');
        }
    }

    search(term) {
        // Only perform local search when in local mode
        if (this.currentEngine !== 'local') return;

        const searchTerm = term.toLowerCase();
        const searchPinyin = Utils.toPinyin(term.toLowerCase());

        // Get categories dynamically each time
        const categories = document.querySelectorAll('.category');

        let totalVisible = 0;

        categories.forEach(category => {
            let hasVisibleCards = false;
            const cards = category.querySelectorAll('.card');

            cards.forEach(card => {
                const titleEl = card.querySelector('.card-title');
                const descEl = card.querySelector('.card-desc');
                const tagEl = card.querySelector('.card-tag');

                // Get original text (remove any existing highlights)
                const titleOriginal = titleEl.getAttribute('data-original') || titleEl.textContent;
                const descOriginal = descEl.getAttribute('data-original') || descEl.textContent;
                const tagOriginal = tagEl ? (tagEl.getAttribute('data-original') || tagEl.textContent) : '';

                // Store original text
                titleEl.setAttribute('data-original', titleOriginal);
                descEl.setAttribute('data-original', descOriginal);
                if (tagEl) tagEl.setAttribute('data-original', tagOriginal);

                const title = titleOriginal.toLowerCase();
                const desc = descOriginal.toLowerCase();
                const tag = tagOriginal.toLowerCase();

                const titlePinyin = Utils.toPinyin(title);
                const descPinyin = Utils.toPinyin(desc);

                const matches = searchTerm === '' ||
                               title.includes(searchTerm) ||
                               desc.includes(searchTerm) ||
                               tag.includes(searchTerm) ||
                               titlePinyin.includes(searchPinyin) ||
                               descPinyin.includes(searchPinyin);

                if (matches) {
                    card.style.display = 'flex';
                    hasVisibleCards = true;
                    totalVisible++;

                    // Apply highlighting if there's a search term
                    if (searchTerm) {
                        titleEl.innerHTML = this.highlightText(titleOriginal, searchTerm);
                        descEl.innerHTML = this.highlightText(descOriginal, searchTerm);
                        if (tagEl) tagEl.innerHTML = this.highlightText(tagOriginal, searchTerm);
                    } else {
                        // Clear highlighting
                        titleEl.textContent = titleOriginal;
                        descEl.textContent = descOriginal;
                        if (tagEl) tagEl.textContent = tagOriginal;
                    }
                } else {
                    card.style.display = 'none';
                }
            });

            category.style.display = hasVisibleCards ? 'block' : 'none';
        });

        // Update search results count and show empty state if needed
        this.updateSearchCount(searchTerm, totalVisible);
    }

    /**
     * Highlight matching text
     */
    highlightText(text, searchTerm) {
        if (!searchTerm || !text) return Utils.sanitizeHTML(text);

        const searchTermLower = searchTerm.toLowerCase();
        const textLower = text.toLowerCase();

        // Find the index of the search term
        const index = textLower.indexOf(searchTermLower);

        if (index === -1) {
            // Try pinyin match
            const textPinyin = Utils.toPinyin(textLower);
            const searchPinyin = Utils.toPinyin(searchTermLower);
            const pinyinIndex = textPinyin.indexOf(searchPinyin);

            if (pinyinIndex !== -1) {
                // Calculate approximate character position
                // This is a simple approximation - might not be perfect for all cases
                const beforePinyin = textPinyin.substring(0, pinyinIndex);
                const charIndex = beforePinyin.replace(/[a-z]/g, '').length;
                const matchLength = searchTerm.length;

                const before = Utils.sanitizeHTML(text.substring(0, charIndex));
                const match = Utils.sanitizeHTML(text.substring(charIndex, charIndex + matchLength));
                const after = Utils.sanitizeHTML(text.substring(charIndex + matchLength));

                return `${before}<mark class="search-highlight">${match}</mark>${after}`;
            }

            return Utils.sanitizeHTML(text);
        }

        // Exact match found
        const before = Utils.sanitizeHTML(text.substring(0, index));
        const match = Utils.sanitizeHTML(text.substring(index, index + searchTerm.length));
        const after = Utils.sanitizeHTML(text.substring(index + searchTerm.length));

        return `${before}<mark class="search-highlight">${match}</mark>${after}`;
    }

    updateSearchCount(searchTerm, count) {
        // Remove any existing empty state
        const existingEmptyState = document.querySelector('.search-empty-state');
        if (existingEmptyState) {
            existingEmptyState.remove();
        }

        if (!searchTerm) return;

        // Show empty state if no results
        if (count === 0) {
            this.showEmptyState(searchTerm);
        }

        console.log(`找到 ${count} 个相关网站`);
    }

    showEmptyState(searchTerm) {
        const content = document.querySelector('.content');
        if (!content) return;

        // Find the position after recent visits
        const recentVisits = document.getElementById('recentVisits');
        const insertPosition = recentVisits ? recentVisits.nextSibling : content.firstChild;

        const emptyState = document.createElement('div');
        emptyState.className = 'search-empty-state';
        emptyState.innerHTML = `
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">未找到匹配的网站</div>
            <div class="empty-state-desc">
                没有找到与 "<strong>${Utils.sanitizeHTML(searchTerm)}</strong>" 相关的网站
            </div>
            <div class="empty-state-tips">
                <p>💡 搜索小贴士：</p>
                <ul>
                    <li>尝试使用其他关键词</li>
                    <li>支持拼音搜索，如输入 "blbl" 可以找到哔哩哔哩</li>
                    <li>可以切换到 Google、Bing 等搜索引擎进行网络搜索</li>
                </ul>
            </div>
        `;

        content.insertBefore(emptyState, insertPosition);
    }
}

// ==================== Navigation Manager ====================
class NavigationManager {
    constructor() {
        this.menuLinks = document.querySelectorAll('.sidebar-menu a');
        this.init();
    }

    init() {
        this.setupMenuClicks();
        this.setupScrollSpy();
    }

    // Refresh categories after they're loaded
    refreshCategories() {
        this.categories = document.querySelectorAll('.category');
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
        // Refresh categories in case they were loaded dynamically
        if (!this.categories || this.categories.length === 0) {
            this.refreshCategories();
        }

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
    constructor(favoritesManager, historyManager, tagFilterManager, ratingManager) {
        this.favoritesManager = favoritesManager;
        this.historyManager = historyManager;
        this.tagFilterManager = tagFilterManager;
        this.ratingManager = ratingManager;
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
            this.renderRecentVisits();

            // Hide skeleton after loading
            this.hideSkeleton();

            // Notify that categories are loaded
            if (window.app && window.app.navigationManager) {
                window.app.navigationManager.refreshCategories();
            }
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

    renderRecentVisits() {
        const recentVisitsContainer = document.getElementById('recentVisits');
        const recentVisitsItems = document.getElementById('recentVisitsItems');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');

        if (!recentVisitsContainer || !recentVisitsItems) return;

        // Get recent visits (limit to 10)
        const recentVisits = this.historyManager.getAll().slice(0, 10);

        // Clear existing items
        recentVisitsItems.innerHTML = '';

        if (recentVisits.length === 0) {
            // Remove has-items class, hide content area
            recentVisitsContainer.classList.remove('has-items');
            return;
        }

        // Add has-items class to show content area
        recentVisitsContainer.classList.add('has-items');

        // Setup clear history button
        if (clearHistoryBtn) {
            // Remove old event listeners by cloning
            const newClearBtn = clearHistoryBtn.cloneNode(true);
            clearHistoryBtn.parentNode.replaceChild(newClearBtn, clearHistoryBtn);

            newClearBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有访问历史吗？')) {
                    this.historyManager.clear();
                    this.renderRecentVisits();
                }
            });
        }

        // Render recent visit items
        recentVisits.forEach(site => {
            const recentItem = this.createRecentVisitItem(site);
            recentVisitsItems.appendChild(recentItem);
        });
    }

    createRecentVisitItem(site) {
        const card = document.createElement('a');
        card.href = site.url;
        card.className = 'card';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.setAttribute('data-url', site.url);

        // Add fade-in animation class
        setTimeout(() => {
            card.classList.add('fade-in');
        }, 10);

        // Extract domain for favicon
        let domain = '';
        try {
            const url = new URL(site.url);
            domain = url.hostname;
        } catch (e) {
            domain = site.url;
        }

        const faviconUrl = site.iconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        // Calculate time ago
        const timeAgo = site.timestamp ? Utils.formatDate(new Date(site.timestamp)) : '最近';

        card.innerHTML = `
            <div class="card-icon-wrapper">
                <img class="card-favicon" src="${faviconUrl}" alt="${site.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="card-icon-fallback" style="display:none;">${site.icon || '🌐'}</div>
            </div>
            <div class="card-content">
                <div class="card-title">${Utils.sanitizeHTML(site.name)}</div>
                <div class="card-desc">${Utils.sanitizeHTML(site.description || '')}</div>
            </div>
            <span class="visit-badge" title="访问次数">👁️ ${site.visits || 1}</span>
            <span class="time-badge" title="最后访问时间">${timeAgo}</span>
        `;

        // Add click handler for history
        card.addEventListener('click', (e) => {
            this.historyManager.add(site);
            this.renderRecentVisits();
        });

        return card;
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
            // Check if this is a two-level category structure
            if (category.subcategories) {
                // Render each subcategory
                category.subcategories.forEach(subcategory => {
                    const subCategoryEl = this.createCategoryElement(subcategory, category.name);
                    content.appendChild(subCategoryEl);
                });
            } else {
                // Fallback: single-level category (backward compatibility)
                const categoryEl = this.createCategoryElement(category, category.name);
                content.appendChild(categoryEl);
            }
        });
    }

    createCategoryElement(category, parentCategoryName) {
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

        categoryDiv.innerHTML = header;

        // Add tag filter bar if there are multiple tags
        if (this.tagFilterManager) {
            const filterBar = this.tagFilterManager.createTagFilterBar(category.id, category.sites);
            if (filterBar) {
                categoryDiv.appendChild(filterBar);
            }
        }

        // Create cards container
        const cardsDiv = document.createElement('div');
        cardsDiv.className = 'cards';

        category.sites.forEach(site => {
            const card = this.createCardElement(site, parentCategoryName || category.name);
            cardsDiv.appendChild(card);
        });

        categoryDiv.appendChild(cardsDiv);

        return categoryDiv;
    }

    createCardElement(site, categoryName) {
        const card = document.createElement('a');
        card.href = site.url;
        card.className = 'card';
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.setAttribute('data-url', site.url);

        // Add fade-in animation class
        setTimeout(() => {
            card.classList.add('fade-in');
        }, 10);

        // Add favorite class if needed
        if (this.favoritesManager.isFavorite(site.url)) {
            card.classList.add('favorited');
        }

        // Extract domain for favicon
        let domain = '';
        try {
            const url = new URL(site.url);
            domain = url.hostname;
        } catch (e) {
            domain = site.url;
        }

        // Use real favicon with fallback to emoji
        const faviconUrl = site.iconUrl || `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        card.innerHTML = `
            <div class="card-icon-wrapper">
                <img class="card-favicon" src="${faviconUrl}" alt="${site.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="card-icon-fallback" style="display:none;">${site.icon}</div>
            </div>
            <div class="card-content">
                <div class="card-title">${Utils.sanitizeHTML(site.name)}</div>
                <div class="card-desc">${Utils.sanitizeHTML(site.description)}</div>
            </div>
            <span class="card-tag">${Utils.sanitizeHTML(site.tag)}</span>
        `;

        // Rating widget removed to avoid covering site description

        // Add click handler for history
        card.addEventListener('click', (e) => {
            this.historyManager.add(site);
            this.renderRecentVisits();
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
        let totalSites = 0;
        let totalSubcategories = 0;

        categories.forEach(cat => {
            if (cat.subcategories) {
                // Two-level structure
                totalSubcategories += cat.subcategories.length;
                cat.subcategories.forEach(subcat => {
                    totalSites += subcat.sites.length;
                });
            } else {
                // Single-level structure (backward compatibility)
                totalSites += cat.sites.length;
                totalSubcategories++;
            }
        });

        const totalSitesEl = document.getElementById('totalSites');
        if (totalSitesEl) {
            totalSitesEl.textContent = totalSites + '+';
        }

        // Update category count in stats (will be handled separately in HTML)
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

// ==================== Rating Manager ====================
class RatingManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEYS.RATINGS;
        this.userRatings = this.loadRatings();
    }

    /**
     * Load user ratings from localStorage
     */
    loadRatings() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Failed to load ratings:', error);
            return {};
        }
    }

    /**
     * Save ratings to localStorage
     */
    saveRatings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userRatings));
        } catch (error) {
            console.error('Failed to save ratings:', error);
        }
    }

    /**
     * Get rating for a site (user rating or default)
     */
    getRating(url) {
        return this.userRatings[url] || null;
    }

    /**
     * Set user rating for a site
     */
    setRating(url, rating) {
        this.userRatings[url] = {
            rating: rating,
            timestamp: Date.now()
        };
        this.saveRatings();
    }

    /**
     * Calculate display rating (average of default + user rating if exists)
     */
    getDisplayRating(site) {
        const userRating = this.userRatings[site.url];
        const defaultRating = site.rating || 4.0;

        if (userRating) {
            // Average user rating with default rating
            return ((defaultRating + userRating.rating) / 2).toFixed(1);
        }

        return defaultRating.toFixed(1);
    }

    /**
     * Get rating count (default + 1 if user rated)
     */
    getRatingCount(site) {
        const baseCount = site.ratingCount || 500;
        const userRating = this.userRatings[site.url];

        return userRating ? baseCount + 1 : baseCount;
    }

    /**
     * Create star rating display
     */
    createStarDisplay(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let stars = '';

        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '★';
        }

        // Half star
        if (hasHalfStar) {
            stars += '⭐';
        }

        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '☆';
        }

        return stars;
    }

    /**
     * Create interactive rating widget
     */
    createRatingWidget(site, onRate) {
        const container = document.createElement('div');
        container.className = 'rating-widget';

        const displayRating = this.getDisplayRating(site);
        const ratingCount = this.getRatingCount(site);
        const userRating = this.userRatings[site.url];

        container.innerHTML = `
            <div class="rating-display">
                <span class="rating-stars">${this.createStarDisplay(parseFloat(displayRating))}</span>
                <span class="rating-value">${displayRating}</span>
                <span class="rating-count">(${ratingCount})</span>
            </div>
            <div class="rating-interactive" style="display: none;">
                <span class="rate-label">评分：</span>
                ${[1, 2, 3, 4, 5].map(star => `
                    <span class="rate-star" data-rating="${star}">☆</span>
                `).join('')}
            </div>
            ${userRating ? '<span class="user-rated-indicator">已评分</span>' : ''}
        `;

        // Add interactive rating functionality
        const interactive = container.querySelector('.rating-interactive');
        const rateStars = container.querySelectorAll('.rate-star');

        // Show interactive rating on hover
        container.addEventListener('mouseenter', () => {
            interactive.style.display = 'flex';
        });

        container.addEventListener('mouseleave', () => {
            interactive.style.display = 'none';
        });

        // Handle star hover
        rateStars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(rateStars, index + 1);
            });

            star.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const rating = parseInt(star.dataset.rating);
                this.setRating(site.url, rating);
                if (onRate) onRate(site);
            });
        });

        interactive.addEventListener('mouseleave', () => {
            this.resetStars(rateStars);
        });

        return container;
    }

    /**
     * Highlight stars up to index
     */
    highlightStars(stars, count) {
        stars.forEach((star, index) => {
            star.textContent = index < count ? '★' : '☆';
        });
    }

    /**
     * Reset stars to empty
     */
    resetStars(stars) {
        stars.forEach(star => {
            star.textContent = '☆';
        });
    }
}

// Hot Search Widget removed

// ==================== Lime Lab Manager ====================
class LimeLab {
    constructor(siteRenderer) {
        this.siteRenderer = siteRenderer;
        this.section = document.getElementById('limeLab');
        this.aiToolsPanel = document.getElementById('aiToolsPanel');
        this.creativeSitesPanel = document.getElementById('creativeSitesPanel');
        this.aiToolsCards = document.getElementById('aiToolsCards');
        this.creativeSitesCards = document.getElementById('creativeSitesCards');
        this.tabs = document.querySelectorAll('.lime-lab-tab');
        this.panels = document.querySelectorAll('.lime-lab-panel');
        this.isLoaded = false;
        this.observer = null;
    }

    init() {
        if (!this.section) return;

        this.setupTabs();
        // Load content immediately instead of lazy loading
        this.loadContent();
    }

    setupTabs() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.currentTarget.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(targetTab) {
        // Update tab states
        this.tabs.forEach(tab => {
            const isActive = tab.dataset.tab === targetTab;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update panel states
        this.panels.forEach(panel => {
            const isActive = panel.dataset.panel === targetTab;
            panel.classList.toggle('active', isActive);
        });
    }

    setupLazyLoading() {
        // Use Intersection Observer for lazy loading
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoaded) {
                    this.loadContent();
                    this.isLoaded = true;
                    this.observer.disconnect();
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '100px'
        });

        this.observer.observe(this.section);
    }

    loadContent() {
        if (!window.SITES_DATA || !window.SITES_DATA.categories) {
            console.warn('LimeLab: SITES_DATA not available');
            return;
        }

        console.log('LimeLab: Starting content load');

        const aiTools = [];
        const creativeSites = [];

        // Collect AI tools and creative sites from all categories
        SITES_DATA.categories.forEach(category => {
            if (category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.sites) {
                        subcategory.sites.forEach(site => {
                            // Check if site is AI-related
                            if (this.isAITool(site, subcategory)) {
                                aiTools.push({
                                    ...site,
                                    categoryName: category.name,
                                    subcategoryName: subcategory.name
                                });
                            }
                            // Check if site is creative/inspiring
                            if (this.isCreativeSite(site, subcategory, category)) {
                                creativeSites.push({
                                    ...site,
                                    categoryName: category.name,
                                    subcategoryName: subcategory.name
                                });
                            }
                        });
                    }
                });
            }
        });

        console.log(`LimeLab: Found ${aiTools.length} AI tools and ${creativeSites.length} creative sites`);

        // Update counts
        this.updateCount('aiToolsCount', aiTools.length);
        this.updateCount('creativeSitesCount', creativeSites.length);

        // Render cards
        this.renderCards(this.aiToolsCards, aiTools);
        this.renderCards(this.creativeSitesCards, creativeSites);
    }

    isAITool(site, subcategory) {
        // Check if site is in AI category or has AI-related keywords
        const aiKeywords = ['ai', 'gpt', 'chatgpt', 'midjourney', 'stable', 'diffusion',
                           'claude', 'gemini', 'copilot', '智能', '机器学习', '深度学习'];

        const nameMatch = aiKeywords.some(keyword =>
            site.name.toLowerCase().includes(keyword)
        );

        const descMatch = aiKeywords.some(keyword =>
            site.description.toLowerCase().includes(keyword)
        );

        const categoryMatch = subcategory.id === 'tech-ai' ||
                              subcategory.name.includes('AI');

        return nameMatch || descMatch || categoryMatch;
    }

    isCreativeSite(site, subcategory, category) {
        // Check if site is in creative/design categories or has creative keywords
        const creativeKeywords = ['design', 'inspiration', 'creative', 'art', 'dribbble',
                                 'behance', 'awwwards', 'codepen', '设计', '创意', '灵感'];

        const nameMatch = creativeKeywords.some(keyword =>
            site.name.toLowerCase().includes(keyword)
        );

        const descMatch = creativeKeywords.some(keyword =>
            site.description.toLowerCase().includes(keyword)
        );

        const categoryMatch = category.name.includes('创意') ||
                              category.name.includes('设计') ||
                              subcategory.id === 'creative-inspiration' ||
                              subcategory.id === 'creative-tools' ||
                              subcategory.id === 'entertainment-fun';

        return nameMatch || descMatch || categoryMatch;
    }

    updateCount(elementId, count) {
        const countEl = document.getElementById(elementId);
        if (countEl) {
            countEl.textContent = count;
        }
    }

    renderCards(container, sites) {
        if (!container || sites.length === 0) return;

        // Clear existing content
        container.innerHTML = '';

        // Render each site using SiteRenderer's card creation
        sites.forEach((site, index) => {
            const card = this.siteRenderer.createCardElement(site, site.categoryName);

            // Add staggered animation delay
            setTimeout(() => {
                card.classList.add('fade-in');
            }, index * 30);

            container.appendChild(card);
        });
    }
}

// ==================== Daily Picks Carousel ====================
class DailyPicksCarousel {
    constructor(siteRenderer) {
        this.siteRenderer = siteRenderer;
        this.section = document.getElementById('dailyPicksCarousel');
        this.track = document.getElementById('carouselTrack');
        this.indicatorsContainer = document.getElementById('carouselIndicators');
        this.dateDisplay = document.getElementById('carouselDate');

        this.dailySites = [];
        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.autoPlayDelay = 5000; // 5 seconds
    }

    init() {
        if (!this.section) return;

        this.updateDate();
        this.selectDailySites();
        this.renderCards();
        this.startAutoPlay();
    }

    updateDate() {
        if (!this.dateDisplay) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        this.dateDisplay.textContent = `${year}-${month}-${day}`;
    }

    // Generate date-based seed for consistent daily selections
    getDateSeed() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        return year * 10000 + month * 100 + day;
    }

    // Seeded random number generator for consistent daily picks
    seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    selectDailySites() {
        if (!window.SITES_DATA || !window.SITES_DATA.categories) return;

        // Collect all sites
        const allSites = [];
        SITES_DATA.categories.forEach(category => {
            if (category.subcategories) {
                category.subcategories.forEach(subcategory => {
                    if (subcategory.sites) {
                        subcategory.sites.forEach(site => {
                            allSites.push({
                                ...site,
                                categoryName: category.name,
                                subcategoryName: subcategory.name
                            });
                        });
                    }
                });
            }
        });

        // Shuffle using seeded random
        const seed = this.getDateSeed();
        const shuffled = allSites.sort((a, b) => {
            return this.seededRandom(seed + a.url.length) - 0.5;
        });

        // Select top 5
        this.dailySites = shuffled.slice(0, 5);
    }

    renderCards() {
        if (!this.track || this.dailySites.length === 0) return;

        // Clear existing content
        this.track.innerHTML = '';

        // Render cards
        this.dailySites.forEach((site, index) => {
            const card = this.siteRenderer.createCardElement(site, site.categoryName);
            card.classList.add('carousel-card', 'fade-in');
            this.track.appendChild(card);
        });

        // Setup indicators
        this.renderIndicators();
        this.updateCarousel();
    }

    renderIndicators() {
        if (!this.indicatorsContainer) return;

        this.indicatorsContainer.innerHTML = '';

        this.dailySites.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'carousel-indicator';
            if (index === 0) indicator.classList.add('active');
            indicator.setAttribute('aria-label', `跳转到第${index + 1}个`);

            indicator.addEventListener('click', () => {
                this.goToSlide(index);
            });

            this.indicatorsContainer.appendChild(indicator);
        });
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.updateCarousel();
        this.resetAutoPlay();
    }

    updateCarousel() {
        if (!this.track) return;

        // Get card width including gap
        const card = this.track.querySelector('.carousel-card');
        if (!card) return;

        const cardWidth = card.offsetWidth;
        const gap = 12; // Match CSS gap
        const offset = -(this.currentIndex * (cardWidth + gap));

        this.track.style.transform = `translateX(${offset}px)`;

        // Update indicators
        const indicators = this.indicatorsContainer?.querySelectorAll('.carousel-indicator');
        indicators?.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
    }

    next() {
        if (this.currentIndex < this.dailySites.length - 1) {
            this.currentIndex++;
        } else {
            // Loop back to start
            this.currentIndex = 0;
        }
        this.updateCarousel();
    }

    startAutoPlay() {
        if (this.autoPlayInterval) return;

        this.autoPlayInterval = setInterval(() => {
            this.next();
        }, this.autoPlayDelay);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetAutoPlay() {
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    // Date-based site selection remains below
}

// ==================== Tag Filter Manager ====================
class TagFilterManager {
    constructor() {
        this.activeFilters = new Map(); // Map<categoryId, selectedTag>
    }

    /**
     * Collect all unique tags from a category's sites
     */
    collectTags(sites) {
        const tags = new Set();
        sites.forEach(site => {
            if (site.tag) {
                tags.add(site.tag);
            }
        });
        return Array.from(tags).sort();
    }

    /**
     * Create tag filter bar for a category
     */
    createTagFilterBar(categoryId, sites) {
        const tags = this.collectTags(sites);

        // Don't show filter if there's only one tag or no tags
        if (tags.length <= 1) {
            return null;
        }

        const filterBar = document.createElement('div');
        filterBar.className = 'tag-filter-bar';
        filterBar.setAttribute('data-category-id', categoryId);

        // Add "全部" (All) button
        const allButton = this.createTagButton('全部', true, categoryId);
        filterBar.appendChild(allButton);

        // Add tag buttons
        tags.forEach(tag => {
            const button = this.createTagButton(tag, false, categoryId);
            filterBar.appendChild(button);
        });

        return filterBar;
    }

    /**
     * Create a single tag filter button
     */
    createTagButton(tag, isActive, categoryId) {
        const button = document.createElement('button');
        button.className = 'tag-filter-btn' + (isActive ? ' active' : '');
        button.textContent = tag;
        button.setAttribute('data-tag', tag);

        button.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleTagClick(categoryId, tag, button);
        });

        return button;
    }

    /**
     * Handle tag button click
     */
    handleTagClick(categoryId, tag, clickedButton) {
        const filterBar = clickedButton.parentElement;
        const cardsContainer = filterBar.nextElementSibling;

        // Update active state
        filterBar.querySelectorAll('.tag-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');

        // Store active filter
        if (tag === '全部') {
            this.activeFilters.delete(categoryId);
        } else {
            this.activeFilters.set(categoryId, tag);
        }

        // Filter cards
        this.filterCards(cardsContainer, tag);
    }

    /**
     * Filter cards based on selected tag
     */
    filterCards(cardsContainer, selectedTag) {
        const cards = cardsContainer.querySelectorAll('.card');

        cards.forEach(card => {
            const cardTag = card.querySelector('.card-tag');

            if (selectedTag === '全部' || !cardTag) {
                // Show all cards
                card.style.display = '';
                setTimeout(() => card.classList.add('fade-in'), 10);
            } else {
                // Filter by tag
                const tagText = cardTag.textContent.trim();
                if (tagText === selectedTag) {
                    card.style.display = '';
                    setTimeout(() => card.classList.add('fade-in'), 10);
                } else {
                    card.style.display = 'none';
                    card.classList.remove('fade-in');
                }
            }
        });
    }

    /**
     * Reset all filters
     */
    resetFilters() {
        this.activeFilters.clear();
        document.querySelectorAll('.tag-filter-bar').forEach(filterBar => {
            // Reset to "全部" button
            const allButton = filterBar.querySelector('[data-tag="全部"]');
            if (allButton) {
                allButton.click();
            }
        });
    }
}

// ==================== Mobile Menu Manager ====================
class MobileMenuManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.backdrop = null;
        this.touchStartX = 0;
        this.setupBackdrop();
        this.setupToggle();
        this.setupSwipeClose();
    }

    setupBackdrop() {
        // 创建遮罩层
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'sidebar-backdrop';
        document.body.appendChild(this.backdrop);

        // 点击遮罩层关闭侧边栏
        this.backdrop.addEventListener('click', () => {
            this.closeSidebar();
        });
    }

    setupToggle() {
        window.toggleSidebar = () => {
            const isShowing = this.sidebar?.classList.contains('mobile-show');
            if (isShowing) {
                this.closeSidebar();
            } else {
                this.openSidebar();
            }
        };
    }

    setupSwipeClose() {
        // 支持向左滑动关闭侧边栏
        if (!this.sidebar) return;

        this.sidebar.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
        });

        this.sidebar.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = this.touchStartX - touchEndX;

            // 向左滑动超过50px则关闭
            if (diff > 50) {
                this.closeSidebar();
            }
        });
    }

    openSidebar() {
        this.sidebar?.classList.add('mobile-show');
        this.backdrop?.classList.add('visible');
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }

    closeSidebar() {
        this.sidebar?.classList.remove('mobile-show');
        this.backdrop?.classList.remove('visible');
        document.body.style.overflow = ''; // 恢复滚动
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
        this.ratingManager = new RatingManager();
        this.tagFilterManager = new TagFilterManager();
        this.siteRenderer = new SiteRenderer(this.favoritesManager, this.historyManager, this.tagFilterManager, this.ratingManager);
        this.dailyPicksCarousel = new DailyPicksCarousel(this.siteRenderer);
        // LimeLab removed
        this.searchManager = new SearchManager();
        this.navigationManager = new NavigationManager();
        this.mobileMenuManager = new MobileMenuManager();
        this.keyboardNavigationManager = new KeyboardNavigationManager();
    }

    async init() {
        try {
            // Make app available globally before loading sites
            window.app = this;
            await this.siteRenderer.loadSites();

            // Initialize components after sites are loaded
            this.dailyPicksCarousel.init();
            // LimeLab removed

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

// ==================== Category Toggle Function ====================
function toggleCategory(labelElement) {
    const submenu = labelElement.nextElementSibling;

    // Toggle collapsed class on label
    labelElement.classList.toggle('collapsed');

    // Toggle expanded/collapsed class on submenu
    if (submenu.classList.contains('expanded')) {
        submenu.classList.remove('expanded');
        submenu.classList.add('collapsed');
    } else {
        submenu.classList.remove('collapsed');
        submenu.classList.add('expanded');
    }
}

// Make toggleCategory available globally
window.toggleCategory = toggleCategory;
