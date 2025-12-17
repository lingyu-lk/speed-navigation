# Assets 目录说明

## 📁 目录结构

```
assets/
├── icons/              # PWA 和各平台图标
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
├── og-image.png        # 社交媒体分享预览图 (1200x630)
└── icon-generator.html # 图标生成工具（本文件）
```

## 🎨 快速生成图标

### 方法 1：使用内置图标生成器（推荐）

1. 在浏览器中打开 `assets/icon-generator.html`
2. 点击"生成所有图标"按钮
3. 图标会自动下载到您的下载文件夹
4. 将下载的图标文件移动到 `assets/icons/` 目录

### 方法 2：在线工具

如果您想使用自己的图标设计，可以使用以下在线工具：

1. **PWA Icon Generator**
   - https://www.pwabuilder.com/imageGenerator
   - 上传一张 512x512 的图片，自动生成所有尺寸

2. **Favicon.io**
   - https://favicon.io/
   - 可以从文字、图片或 Emoji 生成图标

3. **RealFaviconGenerator**
   - https://realfavicongenerator.net/
   - 生成所有平台适配的图标

## 📋 所需图标清单

| 文件名 | 尺寸 | 用途 |
|--------|------|------|
| icon-72x72.png | 72×72 | PWA 小图标 |
| icon-96x96.png | 96×96 | PWA 图标 |
| icon-128x128.png | 128×128 | PWA 图标 |
| icon-144x144.png | 144×144 | Windows 磁贴 |
| icon-152x152.png | 152×152 | iPad 图标 |
| icon-192x192.png | 192×192 | Android Chrome |
| icon-384x384.png | 384×384 | PWA 高清图标 |
| icon-512x512.png | 512×512 | PWA 启动画面 |
| apple-touch-icon.png | 180×180 | iOS 主屏幕图标 |
| og-image.png | 1200×630 | 社交分享预览图 |

## ✅ 生成完成后

确保所有文件都在正确的位置：

```bash
# 检查文件是否存在
ls -la assets/icons/
ls -la assets/og-image.png
```

## 🔧 手动创建说明

如果您想手动创建图标，请遵循以下设计规范：

### PWA 图标要求
- **格式**: PNG
- **背景**: 不透明（推荐使用品牌色）
- **内容**: 居中，留白 10%
- **风格**: 简洁明了，易于识别

### OG 图片要求
- **尺寸**: 1200×630 像素
- **格式**: PNG 或 JPG
- **内容**:
  - Logo/品牌标识
  - 网站名称
  - 简短描述
  - 视觉吸引力强

## 📚 相关文档

- [PWA 图标规范](https://web.dev/add-manifest/)
- [Apple Touch Icon 指南](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- [Open Graph 协议](https://ogp.me/)
