// ==================== Service Worker Configuration ====================
const CACHE_NAME = 'limenav-v1.0.0';
const RUNTIME_CACHE = 'limenav-runtime';

// 需要预缓存的核心资源
const PRECACHE_URLS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/pinyin.js',
    './js/sites-data.js',
    './js/effects.js',
    './js/online-users.js',
    './data/sites.json',
    './manifest.json'
];

// 需要缓存的外部资源模式
const CACHE_PATTERNS = [
    /^https:\/\/cdn\.jsdelivr\.net\//,
    /^https:\/\/fonts\.googleapis\.com\//,
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/
];

// ==================== Install Event ====================
self.addEventListener('install', (event) => {
    console.log('[Service Worker] 安装中...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] 预缓存核心资源');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[Service Worker] 安装完成');
                return self.skipWaiting(); // 立即激活新的 Service Worker
            })
            .catch((error) => {
                console.error('[Service Worker] 预缓存失败:', error);
            })
    );
});

// ==================== Activate Event ====================
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] 激活中...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 删除旧版本的缓存
                    if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                        console.log('[Service Worker] 删除旧缓存:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] 激活完成');
            return self.clients.claim(); // 立即控制所有页面
        })
    );
});

// ==================== Fetch Event ====================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过浏览器扩展和 chrome-extension 请求
    if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
        return;
    }

    // 跳过 Supabase 实时更新请求（需要实时数据）
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // 跳过第三方 API 请求（需要实时数据）
    if (url.hostname.includes('tenapi.cn') ||
        url.hostname.includes('api.') ||
        url.pathname.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // 如果缓存中有响应，返回缓存
                if (cachedResponse) {
                    // 对于核心资源，使用缓存优先策略
                    if (PRECACHE_URLS.includes(url.pathname) || url.pathname === '/') {
                        return cachedResponse;
                    }

                    // 对于其他资源，返回缓存的同时在后台更新
                    fetchAndCache(request);
                    return cachedResponse;
                }

                // 缓存中没有，从网络获取
                return fetchAndCache(request);
            })
            .catch((error) => {
                console.error('[Service Worker] Fetch 失败:', error);

                // 如果是导航请求（HTML页面），返回离线页面
                if (request.destination === 'document') {
                    return caches.match('./index.html');
                }

                // 其他请求返回 null（浏览器会处理错误）
                return null;
            })
    );
});

// ==================== Helper Functions ====================

/**
 * 从网络获取资源并缓存
 */
function fetchAndCache(request) {
    return fetch(request)
        .then((response) => {
            // 检查是否是有效响应
            if (!response || response.status !== 200 || response.type === 'error') {
                return response;
            }

            const url = new URL(request.url);

            // 判断是否需要缓存此资源
            const shouldCache =
                PRECACHE_URLS.includes(url.pathname) ||
                url.pathname === '/' ||
                CACHE_PATTERNS.some(pattern => pattern.test(request.url));

            if (shouldCache) {
                // 克隆响应，因为响应流只能使用一次
                const responseToCache = response.clone();

                caches.open(RUNTIME_CACHE)
                    .then((cache) => {
                        cache.put(request, responseToCache);
                    })
                    .catch((error) => {
                        console.error('[Service Worker] 缓存失败:', error);
                    });
            }

            return response;
        });
}

// ==================== Message Event ====================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('[Service Worker] 收到 SKIP_WAITING 消息');
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        console.log('[Service Worker] 收到清除缓存消息');
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                console.log('[Service Worker] 所有缓存已清除');
                event.ports[0].postMessage({ success: true });
            })
        );
    }
});

// ==================== Push Notification (可选功能) ====================
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : '青柠导航有新内容',
        icon: './assets/icons/icon-192x192.png',
        badge: './assets/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('青柠导航', options)
    );
});

console.log('[Service Worker] 脚本已加载');
