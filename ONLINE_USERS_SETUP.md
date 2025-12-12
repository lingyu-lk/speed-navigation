# 在线人数统计配置指南

本项目使用 Supabase Realtime 实现实时在线人数统计功能。

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 点击 "Start your project" 注册账号（支持 GitHub 登录）
3. 创建新项目：
   - 填写项目名称
   - 设置数据库密码
   - 选择地区（推荐选择 Singapore 或其他亚洲地区）
   - 点击 "Create new project"

### 2. 创建数据库表

项目创建完成后，进入 SQL Editor：

1. 点击左侧菜单的 "SQL Editor"
2. 点击 "+ New query"
3. 复制粘贴以下 SQL 代码并执行：

```sql
-- 创建在线用户表
CREATE TABLE IF NOT EXISTS public.online_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL UNIQUE,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略（RLS）
ALTER TABLE public.online_users ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取
CREATE POLICY "Allow public read access"
ON public.online_users
FOR SELECT
TO public
USING (true);

-- 创建策略：允许所有人插入
CREATE POLICY "Allow public insert"
ON public.online_users
FOR INSERT
TO public
WITH CHECK (true);

-- 创建策略：允许所有人更新
CREATE POLICY "Allow public update"
ON public.online_users
FOR UPDATE
TO public
USING (true);

-- 创建策略：允许所有人删除
CREATE POLICY "Allow public delete"
ON public.online_users
FOR DELETE
TO public
USING (true);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_online_users_last_seen
ON public.online_users(last_seen DESC);

CREATE INDEX IF NOT EXISTS idx_online_users_user_id
ON public.online_users(user_id);

-- 创建自动清理过期用户的函数
CREATE OR REPLACE FUNCTION clean_stale_users()
RETURNS void AS $$
BEGIN
    DELETE FROM public.online_users
    WHERE last_seen < NOW() - INTERVAL '1 minute';
END;
$$ LANGUAGE plpgsql;

-- 创建定时任务（每分钟清理一次）
-- 注意：需要安装 pg_cron 扩展
-- SELECT cron.schedule('clean-stale-users', '* * * * *', 'SELECT clean_stale_users();');
```

4. 点击 "Run" 执行 SQL

### 3. 启用 Realtime

1. 点击左侧菜单的 "Database"
2. 点击 "Replication" 标签
3. 找到 `online_users` 表
4. 点击右侧开关启用 Realtime

### 4. 获取 API 密钥

1. 点击左侧菜单的 "Project Settings" (齿轮图标)
2. 点击 "API" 标签
3. 复制以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 公开的匿名密钥

### 5. 配置项目

打开 `js/online-users.js` 文件，找到配置部分：

```javascript
const SUPABASE_CONFIG = {
    url: 'YOUR_SUPABASE_URL',  // 粘贴你的 Project URL
    anonKey: 'YOUR_SUPABASE_ANON_KEY',  // 粘贴你的 anon public key
    enabled: false  // 配置完成后改为 true
};
```

将配置修改为：

```javascript
const SUPABASE_CONFIG = {
    url: 'https://xxxxx.supabase.co',  // 你的实际 URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // 你的实际 key
    enabled: true  // 启用功能
};
```

### 6. 测试

1. 保存文件并提交到 GitHub
2. 等待 GitHub Pages 部署完成
3. 打开网站，在右上角应该能看到在线人数
4. 用不同浏览器或隐私模式打开，测试在线人数是否增加

## 功能说明

- ✅ 实时显示当前在线人数
- ✅ 自动心跳检测（每15秒更新一次）
- ✅ 自动清理离线用户（30秒无响应即判定离线）
- ✅ 页面最小化时暂停心跳，恢复时继续
- ✅ 页面关闭时自动清理用户记录
- ✅ 完全免费（Supabase 免费额度：500MB 数据库，2GB 传输）

## 免费额度

Supabase 免费计划包含：
- 500MB 数据库空间
- 2GB 带宽/月
- 50,000 月活跃用户
- 500,000 次 Edge Function 调用
- 2 个并发 Realtime 连接（需要升级才能支持更多）

对于中小型网站完全够用！

## 故障排查

### 问题1：显示 "--" 且控制台提示未启用
**解决**: 检查 `SUPABASE_CONFIG.enabled` 是否为 `true`

### 问题2：显示 "--" 但已启用
**解决**:
1. 检查 Supabase URL 和 Key 是否正确
2. 打开浏览器控制台查看错误信息
3. 确认 `online_users` 表已创建且启用了 Realtime

### 问题3：人数不更新
**解决**:
1. 检查 RLS 策略是否正确设置
2. 检查浏览器控制台是否有错误
3. 确认网络连接正常

### 问题4：403 错误
**解决**:
1. 检查 RLS 策略是否已创建
2. 确认使用的是 `anon` key 而不是 `service_role` key

## 安全说明

- 使用 Row Level Security (RLS) 保护数据
- 仅使用公开的 anon key，不暴露 service_role key
- 自动清理过期数据，防止数据库膨胀
- 不收集任何用户个人信息，仅记录临时会话ID

## 高级优化（可选）

### 启用自动清理定时任务

如果想要更强的清理功能，可以启用 pg_cron：

1. 在 Supabase Dashboard 的 SQL Editor 中运行：

```sql
-- 启用 pg_cron 扩展
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 创建每分钟执行的清理任务
SELECT cron.schedule(
    'clean-stale-users',
    '* * * * *',
    'SELECT clean_stale_users();'
);
```

### 自定义心跳间隔

在 `js/online-users.js` 中修改：

```javascript
startHeartbeat() {
    // 将 15000 改为你想要的间隔（毫秒）
    this.heartbeatInterval = setInterval(() => {
        this.updateUser();
        this.updateOnlineCount();
    }, 15000);  // 15秒
}
```

## 支持

如果遇到问题，可以：
1. 查看 [Supabase 官方文档](https://supabase.com/docs)
2. 查看浏览器控制台错误信息
3. 在项目 Issues 中反馈

---

配置完成后，你的网站就拥有了实时在线人数统计功能！🎉
