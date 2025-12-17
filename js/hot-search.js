// ==================== Hot Search Manager ====================
class HotSearchManager {
    constructor() {
        this.currentPlatform = 'weibo';
        this.cache = {}; // 缓存数据
        this.cacheExpiry = 5 * 60 * 1000; // 缓存5分钟

        // API配置 - 使用免费的热搜API
        this.apiConfig = {
            weibo: {
                name: '微博热搜',
                url: 'https://api.vvhan.com/api/hotlist/wbHot',
                parseData: (data) => this.parseVvhanData(data)
            },
            zhihu: {
                name: '知乎热榜',
                url: 'https://api.vvhan.com/api/hotlist/zhihuHot',
                parseData: (data) => this.parseVvhanData(data)
            },
            baidu: {
                name: '百度热搜',
                url: 'https://api.vvhan.com/api/hotlist/baiduRD',
                parseData: (data) => this.parseVvhanData(data)
            },
            douyin: {
                name: '抖音热榜',
                url: 'https://api.vvhan.com/api/hotlist/douyinHot',
                parseData: (data) => this.parseVvhanData(data)
            }
        };

        this.init();
    }

    init() {
        this.setupPlatformButtons();
        this.loadHotSearch(this.currentPlatform);
    }

    setupPlatformButtons() {
        const buttons = document.querySelectorAll('.platform-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const platform = btn.dataset.platform;
                if (platform === this.currentPlatform) return;

                // 更新按钮状态
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 切换平台
                this.currentPlatform = platform;
                this.loadHotSearch(platform);
            });
        });
    }

    async loadHotSearch(platform) {
        const listEl = document.getElementById('hotSearchList');
        if (!listEl) return;

        // 检查缓存
        if (this.isCacheValid(platform)) {
            this.renderHotSearch(this.cache[platform].data);
            return;
        }

        // 显示加载状态
        listEl.innerHTML = `
            <div class="hot-search-loading">
                <div class="hot-search-loading-icon">⏳</div>
                <div>正在加载${this.apiConfig[platform].name}...</div>
            </div>
        `;

        try {
            const config = this.apiConfig[platform];
            const response = await fetch(config.url);

            if (!response.ok) {
                throw new Error('网络请求失败');
            }

            const result = await response.json();

            // 解析数据
            const data = config.parseData(result);

            if (!data || data.length === 0) {
                throw new Error('暂无数据');
            }

            // 只取前10条
            const top10 = data.slice(0, 10);

            // 缓存数据
            this.cache[platform] = {
                data: top10,
                timestamp: Date.now()
            };

            // 渲染
            this.renderHotSearch(top10);

        } catch (error) {
            console.error('加载热搜失败:', error);
            this.showError(platform);
        }
    }

    parseVvhanData(result) {
        if (!result || !result.success || !result.data) {
            return [];
        }

        return result.data.map(item => ({
            title: item.title || item.query || '',
            url: item.url || item.link || '#',
            hot: item.hot || item.hotValue || '',
            tag: item.desc || ''
        }));
    }

    renderHotSearch(data) {
        const listEl = document.getElementById('hotSearchList');
        if (!listEl) return;

        listEl.innerHTML = '';

        data.forEach((item, index) => {
            const itemEl = document.createElement('a');
            itemEl.className = 'hot-search-item';
            itemEl.href = item.url;
            itemEl.target = '_blank';
            itemEl.rel = 'noopener noreferrer';

            // 格式化热度值
            const hotValue = this.formatHotValue(item.hot);

            itemEl.innerHTML = `
                <div class="hot-search-rank">${index + 1}</div>
                <div class="hot-search-content">
                    <div class="hot-search-text">${this.escapeHtml(item.title)}</div>
                    <div class="hot-search-meta">
                        ${hotValue ? `
                            <span class="hot-search-hot">
                                🔥 ${hotValue}
                            </span>
                        ` : ''}
                        ${item.tag ? `
                            <span class="hot-search-tag">${this.escapeHtml(item.tag)}</span>
                        ` : ''}
                    </div>
                </div>
            `;

            // 添加淡入动画
            setTimeout(() => {
                itemEl.style.opacity = '0';
                itemEl.style.transform = 'translateY(10px)';
                itemEl.style.transition = 'all 0.3s ease';

                requestAnimationFrame(() => {
                    itemEl.style.opacity = '1';
                    itemEl.style.transform = 'translateY(0)';
                });
            }, index * 30);

            listEl.appendChild(itemEl);
        });
    }

    showError(platform) {
        const listEl = document.getElementById('hotSearchList');
        if (!listEl) return;

        listEl.innerHTML = `
            <div class="hot-search-error">
                <div class="hot-search-error-icon">😔</div>
                <div>加载${this.apiConfig[platform].name}失败</div>
                <div style="margin-top: 8px; font-size: 0.9em; opacity: 0.7;">请检查网络连接或稍后重试</div>
                <button class="hot-search-refresh" onclick="window.hotSearchManager.loadHotSearch('${platform}')">
                    重新加载
                </button>
            </div>
        `;
    }

    isCacheValid(platform) {
        const cached = this.cache[platform];
        if (!cached) return false;

        const now = Date.now();
        return (now - cached.timestamp) < this.cacheExpiry;
    }

    formatHotValue(hot) {
        if (!hot) return '';

        // 如果是数字
        const num = parseInt(hot);
        if (!isNaN(num)) {
            if (num >= 100000000) {
                return (num / 100000000).toFixed(1) + '亿';
            } else if (num >= 10000) {
                return (num / 10000).toFixed(1) + '万';
            }
            return num.toString();
        }

        // 如果是字符串（如"100万"）
        return hot;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hotSearchManager = new HotSearchManager();
    });
} else {
    window.hotSearchManager = new HotSearchManager();
}
