
# 🚀 极速导航

一个现代化、功能丰富的个人网站导航页面，包含 120+ 精选网站，15 个分类，支持夜间模式、收藏、搜索等多种功能。

## ✨ 主要特性

### 🎨 界面设计
- **现代化 UI** - 渐变色背景、毛玻璃效果、流畅动画
- **响应式设计** - 完美适配桌面、平板和手机
- **夜间模式** - 保护眼睛的深色主题，自动保存偏好
- **优雅交互** - 卡片悬停效果、平滑滚动、渐变装饰

### 🔍 搜索功能
- **智能搜索** - 支持网站名称、描述、标签搜索
- **拼音搜索** - 输入拼音即可找到中文网站
- **防抖优化** - 300ms 防抖，提升性能
- **快捷键** - `Ctrl/Cmd + K` 聚焦搜索框，`ESC` 清空搜索

### 💾 数据管理
- **收藏功能** - 右键点击卡片添加/取消收藏
- **访问历史** - 自动记录访问过的网站和次数
- **本地存储** - 所有数据保存在浏览器本地
- **数据持久化** - 刷新页面数据不丢失

### ⚡ 性能优化
- **模块化代码** - CSS、JS、数据分离
- **防抖节流** - 优化搜索和滚动性能
- **懒加载** - 按需加载内容
- **代码分离** - 清晰的文件结构

### ♿ 可访问性
- **ARIA 标签** - 完整的无障碍支持
- **键盘导航** - 支持 Tab 键导航
- **语义化 HTML** - 正确的 HTML5 标签
- **屏幕阅读器友好** - 优化的文本描述

### 🔒 安全性
- **XSS 防护** - HTML 内容转义
- **安全链接** - 所有外部链接添加 `rel="noopener noreferrer"`
- **HTTPS** - 建议使用 HTTPS 部署

### 📊 SEO 优化
- **Meta 标签** - 完整的 SEO meta 信息
- **Open Graph** - 社交媒体分享优化
- **结构化数据** - Schema.org 标记
- **语义化结构** - 搜索引擎友好

## 📁 项目结构

```
model/
├── index-new.html          # 优化后的主页面
├── index.html              # 原始页面（备份）
├── css/
│   └── style.css          # 样式文件（包含夜间模式）
├── js/
│   └── app.js             # 主应用脚本
├── data/
│   └── sites.json         # 网站数据
├── assets/
│   └── icons/             # 图标资源
└── README.md              # 项目文档
```

## 🚀 快速开始

### 方法一：直接使用
1. 克隆或下载项目
2. 用浏览器打开 `index-new.html`
3. 开始使用！

### 方法二：本地服务器
```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve

# 使用 VS Code
# 安装 Live Server 插件，右键点击 HTML 文件选择 "Open with Live Server"
```

访问 `http://localhost:8000/index-new.html`

## ⚙️ 配置

### 修改网站数据
编辑 `data/sites.json` 文件：

```json
{
  "categories": [
    {
      "id": "your-category",
      "icon": "🎯",
      "name": "分类名称",
      "description": "分类描述",
      "sites": [
        {
          "name": "网站名称",
          "url": "https://example.com",
          "icon": "🌐",
          "description": "网站描述",
          "tag": "标签"
        }
      ]
    }
  ]
}
```

### 自定义配置
在 `js/app.js` 中修改 `CONFIG` 对象：

```javascript
const CONFIG = {
    STORAGE_KEYS: {
        THEME: 'nav-theme',
        FAVORITES: 'nav-favorites',
        HISTORY: 'nav-history'
    },
    MAX_HISTORY: 50,
    DEBOUNCE_DELAY: 300
};
```

### 修改主题颜色
在 `css/style.css` 中修改 CSS 变量：

```css
:root {
    --accent-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --accent-color: #667eea;
    /* 其他颜色变量... */
}
```

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + K` | 聚焦搜索框 |
| `ESC` | 清空搜索 |
| `Ctrl/Cmd + D` | 切换主题 |
| `Tab` | 导航到下一个元素 |
| `Shift + Tab` | 导航到上一个元素 |
| `Enter` | 激活当前元素 |

## 🎯 功能说明

### 搜索功能
- 在顶部搜索框输入关键词
- 支持中文、英文、拼音搜索
- 实时过滤显示相关网站
- 自动隐藏无结果的分类

### 收藏功能
- 右键点击网站卡片添加/取消收藏
- 收藏的网站会显示星标
- 收藏数据保存在本地浏览器

### 历史记录
- 自动记录点击的网站
- 显示访问次数（如果实现了 UI）
- 保存最近 50 条记录

### 夜间模式
- 点击右上角按钮切换主题
- 自动保存偏好设置
- 使用 `Ctrl/Cmd + D` 快速切换

## 🔧 高级功能

### 添加自定义网站
未来可以通过界面直接添加自定义网站（当前需要编辑 JSON 文件）

### 导出/导入配置
计划支持导出收藏和历史记录，方便迁移

### PWA 支持
可以添加 Service Worker 实现离线访问

## 📱 浏览器兼容性

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11（不支持）

## 🎨 自定义主题

### 添加新主题
1. 在 `css/style.css` 中添加新的 `data-theme` 规则
2. 在 `js/app.js` 的 `ThemeManager` 中添加主题选项
3. 更新主题切换按钮

### 示例：添加"护眼绿"主题
```css
[data-theme="green"] {
    --bg-primary: linear-gradient(135deg, #2d5016 0%, #3d6b1f 50%, #4a7c25 100%);
    --accent-color: #7cb342;
    /* ... */
}
```

## 🐛 常见问题

### Q: 为什么我的修改没有生效？
A: 清除浏览器缓存或使用 `Ctrl + Shift + R` 强制刷新。

### Q: 如何清空所有数据？
A: 打开浏览器开发者工具，在 Console 中运行：
```javascript
localStorage.clear();
location.reload();
```

### Q: 收藏和历史记录保存在哪里？
A: 保存在浏览器的 localStorage 中，不会上传到服务器。

### Q: 如何添加新的网站分类？
A: 编辑 `data/sites.json`，添加新的 category 对象，并在 HTML 的侧边栏菜单中添加对应的链接。

## 📄 许可证

MIT License - 可自由使用和修改

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

- 项目地址：[GitHub](https://github.com/yourusername/nav)
- 问题反馈：[Issues](https://github.com/yourusername/nav/issues)

## 🙏 致谢

- 图标来源：Emoji
- 设计灵感：现代化导航网站
- 字体：系统默认字体栈

## 📋 更新日志

### v2.0.0 (2025-12-10)
- ✨ 全新的模块化架构
- 🌙 完整的夜间模式支持
- 💾 收藏和历史记录功能
- 🔍 智能搜索（支持拼音）
- ⚡ 性能优化
- ♿ 可访问性改进
- 📊 SEO 优化
- 🔒 安全性增强

### v1.0.0
- 🎉 初始版本

## 🎯 未来计划

- [ ] 自定义添加网站的 UI 界面
- [ ] 拖拽排序功能
- [ ] 导出/导入配置
- [ ] PWA 支持
- [ ] 多语言支持
- [ ] 更多主题选项
- [ ] 云同步功能
