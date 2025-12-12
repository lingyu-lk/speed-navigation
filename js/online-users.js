// ==================== Online Users Tracker ====================
// 使用 Supabase Realtime 实现在线人数统计
//
// 使用说明：
// 1. 访问 https://supabase.com 注册账号（免费）
// 2. 创建新项目
// 3. 获取项目的 URL 和 anon key
// 4. 在下方填入你的配置信息

const SUPABASE_CONFIG = {
    // Supabase 项目配置
    url: 'https://ilvvrtpjrqiekstgmflz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsdnZydHBqcnFpZWtzdGdtZmx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0OTA1OTYsImV4cCI6MjA4MTA2NjU5Nn0.BG77EvCGSDZ1NjIMSXCf6bfi6aup_Ude72sz21jQunQ',
    // 启用在线人数统计
    enabled: true
};

class OnlineUsersTracker {
    constructor() {
        this.supabase = null;
        this.channel = null;
        this.userId = null;
        this.heartbeatInterval = null;
        this.onlineCount = 0;
        this.onlineCountElement = null;
        this.isEnabled = SUPABASE_CONFIG.enabled &&
                        SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_URL' &&
                        SUPABASE_CONFIG.anonKey !== 'YOUR_SUPABASE_ANON_KEY';
    }

    async init() {
        console.log('🔍 在线人数统计初始化中...');
        console.log('配置状态:', {
            enabled: this.isEnabled,
            url: SUPABASE_CONFIG.url,
            hasKey: SUPABASE_CONFIG.anonKey.length > 20
        });

        // 如果未配置或未启用，显示提示信息
        if (!this.isEnabled) {
            console.log('💡 在线人数统计未启用。请访问 https://supabase.com 获取配置信息');
            this.showOfflineUI();
            return;
        }

        try {
            console.log('📡 正在加载 Supabase 客户端...');
            // 加载 Supabase 客户端
            await this.loadSupabaseClient();
            console.log('✅ Supabase 客户端加载成功');

            // 生成唯一用户ID
            this.userId = this.generateUserId();
            console.log('👤 用户ID:', this.userId);

            // 创建用户在线状态表（如果不存在）
            await this.setupTable();
            console.log('✅ 数据表检查完成');

            // 先获取一次在线人数（立即显示）
            await this.updateOnlineCount();

            // 连接到 Realtime Channel
            await this.connectToChannel();
            console.log('✅ Realtime 频道连接成功');

            // 添加当前用户
            await this.addUser();
            console.log('✅ 用户已添加到在线列表');

            // 添加用户后立即更新一次
            await this.updateOnlineCount();

            // 启动心跳
            this.startHeartbeat();
            console.log('💓 心跳启动');

            // 页面关闭时清理
            window.addEventListener('beforeunload', () => this.cleanup());

            // 监听页面可见性变化
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    this.pauseHeartbeat();
                } else {
                    this.resumeHeartbeat();
                }
            });

            console.log('✅ 在线人数统计已启动');
        } catch (error) {
            console.error('❌ 在线人数统计初始化失败:', error);
            this.showOfflineUI();
        }
    }

    async loadSupabaseClient() {
        // 动态加载 Supabase JS 客户端
        if (typeof window.supabase === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
            script.async = true;

            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        // 创建 Supabase 客户端
        this.supabase = window.supabase.createClient(
            SUPABASE_CONFIG.url,
            SUPABASE_CONFIG.anonKey
        );
    }

    async setupTable() {
        // 清理超过 20 秒未更新的用户（更快清理）
        try {
            const twentySecondsAgo = new Date(Date.now() - 20000).toISOString();
            const { error } = await this.supabase
                .from('online_users')
                .delete()
                .lt('last_seen', twentySecondsAgo);

            if (error) {
                console.warn('清理过期用户时出错（可忽略）:', error.message);
            }
        } catch (error) {
            console.warn('setupTable 出错（可忽略）:', error);
        }
    }

    async connectToChannel() {
        // 订阅 online_users 表的变化
        this.channel = this.supabase
            .channel('online-users-channel')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'online_users'
                },
                (payload) => {
                    this.handleRealtimeUpdate(payload);
                }
            )
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log('✅ 已连接到实时频道');
                    // 不需要在这里再次更新，因为外部已经更新过了
                }
            });
    }

    async addUser() {
        // 添加当前用户到在线列表（使用 upsert 避免 unique 冲突）
        const { data, error } = await this.supabase
            .from('online_users')
            .upsert({
                user_id: this.userId,
                last_seen: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            })
            .select();

        if (error) {
            console.error('添加用户失败:', error);
            return false;
        }
        console.log('✅ 用户添加成功:', this.userId.substring(0, 20) + '...');
        return true;
    }

    async updateUser() {
        // 更新用户最后活跃时间
        const { error } = await this.supabase
            .from('online_users')
            .update({ last_seen: new Date().toISOString() })
            .eq('user_id', this.userId);

        if (error) {
            console.error('更新用户失败:', error);
        }
    }

    async removeUser() {
        // 移除用户
        await this.supabase
            .from('online_users')
            .delete()
            .eq('user_id', this.userId);
    }

    async updateOnlineCount() {
        // 获取当前在线人数
        try {
            const twentySecondsAgo = new Date(Date.now() - 20000).toISOString();

            // 先获取实际数据用于调试
            const { data: allUsers, error: debugError } = await this.supabase
                .from('online_users')
                .select('user_id, last_seen')
                .gte('last_seen', twentySecondsAgo);

            if (debugError) {
                console.error('获取在线人数失败:', debugError);
                return;
            }

            this.onlineCount = allUsers ? allUsers.length : 0;
            console.log('📊 当前在线人数:', this.onlineCount);
            console.log('在线用户列表:', allUsers.map(u => ({
                id: u.user_id.substring(0, 15) + '...',
                lastSeen: new Date(u.last_seen).toLocaleTimeString()
            })));

            this.updateUI();
        } catch (error) {
            console.error('updateOnlineCount 出错:', error);
        }
    }

    handleRealtimeUpdate(payload) {
        // 处理实时更新
        console.log('实时更新:', payload);
        this.updateOnlineCount();
    }

    startHeartbeat() {
        // 每 15 秒发送一次心跳
        this.heartbeatInterval = setInterval(() => {
            this.updateUser();
            this.updateOnlineCount();
        }, 15000);
    }

    pauseHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    resumeHeartbeat() {
        if (!this.heartbeatInterval) {
            this.updateUser();
            this.startHeartbeat();
        }
    }

    cleanup() {
        // 清理资源
        this.pauseHeartbeat();
        this.removeUser();
        if (this.channel) {
            this.supabase.removeChannel(this.channel);
        }
    }

    generateUserId() {
        // 生成或获取持久化的用户ID
        // 使用 sessionStorage 确保同一标签页刷新时保持相同ID
        // 使用 localStorage 的随机数确保不同标签页有不同ID
        let tabId = sessionStorage.getItem('online_user_tab_id');
        if (!tabId) {
            // 为这个标签页生成唯一ID
            const browserId = localStorage.getItem('online_user_browser_id') ||
                             'browser_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('online_user_browser_id', browserId);

            tabId = browserId + '_tab_' +
                    Math.random().toString(36).substring(2, 15) +
                    '_' + Date.now();
            sessionStorage.setItem('online_user_tab_id', tabId);
        }
        return tabId;
    }

    updateUI() {
        // 更新UI显示
        const element = document.getElementById('onlineUsersCount');
        if (element) {
            element.textContent = this.onlineCount;
            element.setAttribute('data-count', this.onlineCount);
        }
    }

    showOfflineUI() {
        // 显示离线状态
        const element = document.getElementById('onlineUsersCount');
        if (element) {
            element.textContent = '--';
            element.setAttribute('title', '在线人数统计未启用');
        }
    }
}

// 导出到全局
window.OnlineUsersTracker = OnlineUsersTracker;
