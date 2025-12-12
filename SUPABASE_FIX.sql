-- ==========================================
-- 修复在线人数统计的 SQL 脚本
-- 在 Supabase SQL Editor 中运行这个完整脚本
-- ==========================================

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS public.online_users CASCADE;

-- 2. 重新创建表（不要 UNIQUE 约束，允许重复）
CREATE TABLE public.online_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 禁用 RLS（这是关键！）
ALTER TABLE public.online_users DISABLE ROW LEVEL SECURITY;

-- 4. 创建索引提高性能
CREATE INDEX idx_online_users_last_seen ON public.online_users(last_seen DESC);
CREATE INDEX idx_online_users_user_id ON public.online_users(user_id);

-- 5. 验证：查看当前所有记录
SELECT
    COUNT(*) as total_users,
    COUNT(DISTINCT user_id) as unique_users
FROM public.online_users;

-- 6. 清理超过30秒的旧记录
DELETE FROM public.online_users
WHERE last_seen < NOW() - INTERVAL '30 seconds';

-- 完成！
SELECT '✅ 修复完成！刷新你的网页测试。' as status;
