# 使用指南

## 目录
- [基础使用](#基础使用)
- [高级功能](#高级功能)
- [自定义配置](#自定义配置)
- [常见问题](#常见问题)
- [技巧与窍门](#技巧与窍门)

## 基础使用

### 首次使用
1. 用浏览器打开 `index.html`
2. 浏览器会自动加载所有网站数据
3. 开始探索！

### 搜索网站
1. 点击顶部搜索框（或按 `Ctrl/Cmd + K`）
2. 输入关键词：
   - 支持中文：`哔哩哔哩`
   - 支持英文：`bilibili`
   - 支持拼音：`blbl`
3. 实时过滤显示结果
4. 按 `ESC` 清空搜索

### 浏览分类
- 使用左侧边栏导航
- 点击分类名称跳转到对应区域
- 在移动端点击右上角 `☰` 打开菜单

### 访问网站
- 点击卡片打开网站（新标签页）
- 访问记录会自动保存

## 高级功能

### 收藏网站
1. 在网站卡片上点击**右键**
2. 卡片会显示星标 ⭐ 表示已收藏
3. 再次右键点击取消收藏
4. 收藏数据保存在浏览器本地

### 查看历史记录
- 访问过的网站会被记录
- 保存最近 50 条访问记录
- 包含访问时间和次数

### 切换主题
**方法 1：使用按钮**
- 点击右上角"🌙 夜间模式"按钮

**方法 2：快捷键**
- 按 `Ctrl/Cmd + D`

**主题会自动保存**，下次访问时自动应用。

### 键盘快捷键
| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + K` | 聚焦搜索框 |
| `ESC` | 清空搜索 |
| `Ctrl/Cmd + D` | 切换主题 |
| `Tab` | 下一个元素 |
| `Shift + Tab` | 上一个元素 |
| `Enter` | 激活当前元素 |
| `Space` | 激活按钮 |

## 自定义配置

### 添加/编辑网站

#### 1. 编辑数据文件
打开 `data/sites.json`，找到对应的分类：

```json
{
  "id": "tools",
  "icon": "🛠️",
  "name": "实用工具",
  "description": "提高效率，事半功倍",
  "sites": [
    {
      "name": "你的网站",
      "url": "https://example.com",
      "icon": "🌐",
      "description": "网站描述",
      "tag": "标签"
    }
  ]
}
```

#### 2. 字段说明
- `name`: 网站名称（必填）
- `url`: 网站地址（必填，以 https:// 或 http:// 开头）
- `icon`: 显示的图标（Emoji）
- `description`: 网站描述
- `tag`: 分类标签

#### 3. 保存并刷新
保存文件后，刷新浏览器即可看到更改。

### 添加新分类

#### 1. 在 JSON 中添加分类
```json
{
  "id": "your-category",
  "icon": "🎯",
  "name": "你的分类",
  "description": "分类描述",
  "sites": [...]
}
```

#### 2. 在侧边栏添加链接
编辑 `index.html`，在侧边栏菜单中添加：

```html
<li role="none">
    <a href="#your-category" role="menuitem" aria-label="你的分类">
        <span class="menu-icon" aria-hidden="true">🎯</span>
        <span>你的分类</span>
    </a>
</li>
```

### 修改颜色主题
编辑 `css/style.css`：

```css
:root {
    --accent-gradient: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
    --accent-color: #your-main-color;
}
```

### 修改配置参数
编辑 `js/app.js` 中的 CONFIG 对象：

```javascript
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'nav-theme',
        FAVORITES: 'nav-favorites',
        HISTORY: 'nav-history'
    },
    MAX_HISTORY: 50,        // 修改历史记录数量
    DEBOUNCE_DELAY: 300     // 修改搜索防抖延迟（毫秒）
};
```

## 常见问题

### Q: 如何清除所有数据？
**A:** 打开浏览器开发者工具（F12），在 Console 中运行：
```javascript
localStorage.clear();
location.reload();
```

### Q: 修改 JSON 后没有生效？
**A:**
1. 确保 JSON 格式正确（可以用 JSONLint 检查）
2. 清除浏览器缓存：`Ctrl + Shift + R` 强制刷新
3. 检查浏览器控制台是否有错误信息

### Q: 收藏的网站丢失了？
**A:** 收藏数据保存在 localStorage 中，可能的原因：
- 清除了浏览器数据
- 使用了无痕模式
- 更换了浏览器或设备

### Q: 搜索找不到某些网站？
**A:**
- 确保网站名称、描述或标签包含搜索词
- 如果是中文网站，尝试使用拼音搜索
- 检查 `js/pinyin.js` 是否包含该汉字的拼音映射

### Q: 如何在不同设备间同步数据？
**A:** 目前数据只保存在本地。可以：
1. 手动导出/导入配置（未来功能）
2. 使用浏览器同步功能（如 Chrome Sync）
3. 将文件放在云盘同步目录中

### Q: 可以作为浏览器首页吗？
**A:** 可以！步骤：
1. 将项目部署到服务器或本地服务
2. 在浏览器设置中将其设为首页
3. 或使用本地文件路径（file:///path/to/index.html）

## 技巧与窍门

### 提高搜索效率
1. **使用拼音简写**：输入 `blbl` 找到"哔哩哔哩"
2. **按标签搜索**：输入标签关键词筛选同类网站
3. **组合搜索**：输入多个关键词

### 快速导航
1. **键盘导航**：使用 Tab 键在链接间快速切换
2. **快捷键**：熟练使用 `Ctrl+K`、`Ctrl+D` 等快捷键
3. **返回顶部**：点击右下角箭头或滚动到顶部

### 个性化定制
1. **调整分类顺序**：编辑 JSON 文件中分类的顺序
2. **自定义图标**：使用你喜欢的 Emoji 图标
3. **添加常用网站**：把最常用的网站添加到最前面

### 性能优化
1. **限制历史记录**：如果设备性能较低，可以减少 `MAX_HISTORY`
2. **调整防抖延迟**：根据需要调整 `DEBOUNCE_DELAY`
3. **定期清理**：清理不需要的历史记录和收藏

### 备份数据
定期备份 localStorage 中的数据：

```javascript
// 导出数据
const data = {
    theme: localStorage.getItem('nav-theme'),
    favorites: localStorage.getItem('nav-favorites'),
    history: localStorage.getItem('nav-history')
};
console.log(JSON.stringify(data));
// 复制输出的 JSON 字符串保存

// 导入数据
const data = /* 粘贴你保存的 JSON */;
localStorage.setItem('nav-theme', data.theme);
localStorage.setItem('nav-favorites', data.favorites);
localStorage.setItem('nav-history', data.history);
location.reload();
```

## 进阶使用

### 部署到服务器
1. **使用 GitHub Pages**：
   - 将项目上传到 GitHub
   - 在仓库设置中启用 Pages
   - 访问 `https://username.github.io/repo-name`

2. **使用 Netlify/Vercel**：
   - 拖放项目文件夹到平台
   - 自动部署并获得 URL

3. **使用自己的服务器**：
   - 上传文件到服务器
   - 配置 Web 服务器（Nginx/Apache）

### 添加统计分析
取消注释 HTML 底部的 Analytics 代码：

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### PWA 支持（未来功能）
项目已包含 `manifest.json`，未来可以：
1. 添加 Service Worker
2. 支持离线访问
3. 添加到主屏幕

---

**需要更多帮助？** 请查看 [README.md](./README.md) 或提交 Issue。
