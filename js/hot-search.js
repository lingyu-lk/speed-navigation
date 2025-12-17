// ==================== Hot Search Manager ====================
class HotSearchManager {
    constructor() {
        this.cache = {}; // 缓存数据
        this.cacheExpiry = 5 * 60 * 1000; // 缓存5分钟

        // API配置 - 多个备用API
        this.apiConfigs = {
            weibo: [
                {
                    name: 'vvhan',
                    url: 'https://api.vvhan.com/api/hotlist/wbHot',
                    parse: (data) => this.parseVvhanData(data)
                },
                {
                    name: 'oioweb',
                    url: 'https://api.oioweb.cn/api/hot/weibo',
                    parse: (data) => this.parseOiowebData(data)
                }
            ],
            zhihu: [
                {
                    name: 'vvhan',
                    url: 'https://api.vvhan.com/api/hotlist/zhihuHot',
                    parse: (data) => this.parseVvhanData(data)
                },
                {
                    name: 'oioweb',
                    url: 'https://api.oioweb.cn/api/hot/zhihu',
                    parse: (data) => this.parseOiowebData(data)
                }
            ],
            baidu: [
                {
                    name: 'vvhan',
                    url: 'https://api.vvhan.com/api/hotlist/baiduRD',
                    parse: (data) => this.parseVvhanData(data)
                },
                {
                    name: 'oioweb',
                    url: 'https://api.oioweb.cn/api/hot/baidu',
                    parse: (data) => this.parseOiowebData(data)
                }
            ],
            douyin: [
                {
                    name: 'vvhan',
                    url: 'https://api.vvhan.com/api/hotlist/douyinHot',
                    parse: (data) => this.parseVvhanData(data)
                },
                {
                    name: 'oioweb',
                    url: 'https://api.oioweb.cn/api/hot/douyin',
                    parse: (data) => this.parseOiowebData(data)
                }
            ]
        };

        this.platformNames = {
            weibo: '微博热搜',
            zhihu: '知乎热榜',
            baidu: '百度热搜',
            douyin: '抖音热榜'
        };

        this.init();
    }

    init() {
        // 同时加载所有平台的热搜
        this.loadAllHotSearch();
    }

    async loadAllHotSearch() {
        const platforms = ['weibo', 'zhihu', 'baidu', 'douyin'];

        // 并发加载所有平台
        await Promise.all(
            platforms.map(platform => this.loadHotSearch(platform))
        );
    }

    async loadHotSearch(platform) {
        const listEl = document.getElementById(`${platform}List`);
        if (!listEl) return;

        // 检查缓存
        if (this.isCacheValid(platform)) {
            this.renderHotSearch(platform, this.cache[platform].data);
            return;
        }

        // 显示加载状态
        listEl.innerHTML = `
            <div class="hot-search-loading">
                <div class="hot-search-loading-icon">⏳</div>
                <div style="font-size: 0.85em;">加载中...</div>
            </div>
        `;

        // 尝试多个API
        const apis = this.apiConfigs[platform];
        let success = false;

        for (const api of apis) {
            try {
                console.log(`尝试加载 ${platform} 从 ${api.name}...`);
                const data = await this.fetchFromAPI(api);

                if (data && data.length > 0) {
                    // 只取前5条
                    const top5 = data.slice(0, 5);

                    // 缓存数据
                    this.cache[platform] = {
                        data: top5,
                        timestamp: Date.now()
                    };

                    // 渲染
                    this.renderHotSearch(platform, top5);
                    success = true;
                    break;
                }
            } catch (error) {
                console.warn(`从 ${api.name} 加载 ${platform} 失败:`, error);
                // 继续尝试下一个API
            }
        }

        if (!success) {
            this.showError(platform);
        }
    }

    async fetchFromAPI(api) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10秒超时

        try {
            const response = await fetch(api.url, {
                signal: controller.signal,
                mode: 'cors',
                cache: 'no-cache'
            });

            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            return api.parse(result);

        } catch (error) {
            clearTimeout(timeout);
            throw error;
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

    parseOiowebData(result) {
        if (!result || !result.code || result.code !== 200 || !result.data) {
            return [];
        }

        return result.data.map(item => ({
            title: item.title || '',
            url: item.url || '#',
            hot: item.hot || '',
            tag: item.tag || ''
        }));
    }

    renderHotSearch(platform, data) {
        const listEl = document.getElementById(`${platform}List`);
        if (!listEl) return;

        listEl.innerHTML = '';

        if (!data || data.length === 0) {
            this.showError(platform);
            return;
        }

        data.forEach((item, index) => {
            const itemEl = document.createElement('a');
            itemEl.className = 'hot-search-item';
            itemEl.href = item.url;
            itemEl.target = '_blank';
            itemEl.rel = 'noopener noreferrer';
            itemEl.title = item.title;

            // 格式化热度值
            const hotValue = this.formatHotValue(item.hot);

            itemEl.innerHTML = `
                <div class="hot-search-rank">${index + 1}</div>
                <div class="hot-search-content">
                    <div class="hot-search-text">${this.escapeHtml(item.title)}</div>
                    ${hotValue ? `
                        <div class="hot-search-meta">
                            <span class="hot-search-hot">🔥 ${hotValue}</span>
                        </div>
                    ` : ''}
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
            }, index * 50);

            listEl.appendChild(itemEl);
        });
    }

    showError(platform) {
        const listEl = document.getElementById(`${platform}List`);
        if (!listEl) return;

        // 显示模拟数据作为备选
        const mockData = this.getMockData(platform);
        if (mockData && mockData.length > 0) {
            this.renderHotSearch(platform, mockData);
            return;
        }

        // 如果没有模拟数据，显示错误
        listEl.innerHTML = `
            <div class="hot-search-error">
                <div class="hot-search-error-icon">😔</div>
                <div style="font-size: 0.85em; margin-top: 5px;">暂时无法加载</div>
                <button class="hot-search-refresh" onclick="window.hotSearchManager.retryLoad('${platform}')" style="font-size: 0.8em; padding: 6px 12px; margin-top: 8px;">
                    重试
                </button>
            </div>
        `;
    }

    getMockData(platform) {
        const mockDataMap = {
            weibo: [
                { title: '微博热搜示例1', url: 'https://weibo.com', hot: '100万' },
                { title: '微博热搜示例2', url: 'https://weibo.com', hot: '80万' },
                { title: '微博热搜示例3', url: 'https://weibo.com', hot: '60万' },
                { title: '微博热搜示例4', url: 'https://weibo.com', hot: '40万' },
                { title: '微博热搜示例5', url: 'https://weibo.com', hot: '20万' }
            ],
            zhihu: [
                { title: '知乎热榜示例1', url: 'https://zhihu.com', hot: '50万' },
                { title: '知乎热榜示例2', url: 'https://zhihu.com', hot: '40万' },
                { title: '知乎热榜示例3', url: 'https://zhihu.com', hot: '30万' },
                { title: '知乎热榜示例4', url: 'https://zhihu.com', hot: '20万' },
                { title: '知乎热榜示例5', url: 'https://zhihu.com', hot: '10万' }
            ],
            baidu: [
                { title: '百度热搜示例1', url: 'https://baidu.com', hot: '60万' },
                { title: '百度热搜示例2', url: 'https://baidu.com', hot: '50万' },
                { title: '百度热搜示例3', url: 'https://baidu.com', hot: '40万' },
                { title: '百度热搜示例4', url: 'https://baidu.com', hot: '30万' },
                { title: '百度热搜示例5', url: 'https://baidu.com', hot: '20万' }
            ],
            douyin: [
                { title: '抖音热榜示例1', url: 'https://douyin.com', hot: '70万' },
                { title: '抖音热榜示例2', url: 'https://douyin.com', hot: '60万' },
                { title: '抖音热榜示例3', url: 'https://douyin.com', hot: '50万' },
                { title: '抖音热榜示例4', url: 'https://douyin.com', hot: '40万' },
                { title: '抖音热榜示例5', url: 'https://douyin.com', hot: '30万' }
            ]
        };

        return mockDataMap[platform] || [];
    }

    retryLoad(platform) {
        // 清除缓存并重新加载
        delete this.cache[platform];
        this.loadHotSearch(platform);
    }

    isCacheValid(platform) {
        const cached = this.cache[platform];
        if (!cached) return false;

        const now = Date.now();
        return (now - cached.timestamp) < this.cacheExpiry;
    }

    formatHotValue(hot) {
        if (!hot) return '';

        // 如果已经是带单位的字符串，直接返回
        if (typeof hot === 'string' && (hot.includes('万') || hot.includes('亿'))) {
            return hot;
        }

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

        // 其他情况直接返回
        return hot.toString();
    }

    escapeHtml(text) {
        if (!text) return '';
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
