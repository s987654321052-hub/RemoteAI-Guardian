# RemoteAI Guardian v1.0.0

## 🎉 Release Highlights

完整的 AI 驅動遠程執行系統，支援 iPhone + LINE 整合。

## ✨ 主要功能

✅ **iPhone Web 儀表板** - Safari 中訪問，完整的遠程控制介面
✅ **LINE Bot 命令系統** - 用自然語言通過 LINE 控制系統
✅ **iOS 原生應用** - SwiftUI 開發，原生體驗
✅ **多平台支援** - iOS、macOS、Windows、Linux
✅ **GitHub Actions CI/CD** - 自動化構建和發佈
✅ **Docker 容器化** - 一鍵部署
✅ **Tailscale VPN** - 安全的網絡連接
✅ **實時進度報告** - 通過 LINE 回報任務進度
✅ **遠程命令執行** - 執行任意 Windows/Linux 命令
✅ **設備配對系統** - 令牌化安全認證

## 🚀 快速開始

### 安裝

```bash
git clone https://github.com/s987654321052-hub/RemoteAI-Guardian.git
cd RemoteAI-Guardian
npm install
npm start
```

### 使用

1. **iPhone Safari 訪問**
   ```
   http://your-tailscale-ip:9999
   ```

2. **LINE 命令**
   ```
   help              - 查看幫助
   status            - 系統狀態
   run docker ps     - 執行命令
   ```

3. **iOS 應用**
   - 在 Xcode 中打開 iOS 目錄
   - 部署到 iPhone

## 📋 系統要求

- Node.js 20+
- npm 9+
- Docker（可選）
- Tailscale VPN
- LINE Official Account

### 平台支援

- **iOS**: 14.0+
- **macOS**: 10.13+
- **Windows**: 10+
- **Linux**: Ubuntu 20.04+

## 📚 文檔

- **IPHONE_LINE_SETUP.md** - 完整的 iPhone + LINE 設置指南
- **GITHUB_ACTIONS_QUICKSTART.md** - GitHub Actions 快速開始
- **PACKAGING_AND_DISTRIBUTION.md** - 打包和發佈指南
- **QUICK_REFERENCE.md** - 快速參考和命令速查

## 🏗️ 架構

```
Windows/Mac PC (RemoteAI Guardian)
├── 認證系統 (port 8888)
├── Web 儀表板 (port 9999)
└── LINE 處理器 (port 3001)
    ↓ (Tailscale VPN)
iPhone
├── Safari (Web App)
├── LINE (命令/通知)
└── iOS App (原生)
```

## 🔧 核心模組

| 模組 | 功能 |
|------|------|
| `auth-system.js` | 設備配對和令牌管理 |
| `iphone-dashboard.js` | Web 儀表板 API |
| `line-command-handler.js` | LINE 命令處理 |
| `RemoteAIGuardianApp.swift` | iOS 原生應用 |

## 📦 依賴

- **Express.js** - Web 框架
- **Axios** - HTTP 客戶端
- **dotenv** - 環境變數管理
- **uuid** - 唯一識別符生成

## 🔒 安全特性

✅ 令牌化認證  
✅ LINE 簽名驗證  
✅ Tailscale 加密連接  
✅ 敏感資料環境變數隔離  
✅ GitHub Secret 管理  

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 許可

MIT License - 詳見 LICENSE 文件

## 🎓 開發者

RemoteAI Guardian v1.0.0
Built with ❤️ for remote execution and automation

---

**構建日期**: 2026/02/15
**Node.js**: 20.x
**狀態**: ✅ 生產就緒

## 安裝和部署步驟

### 步驟 1: 克隆倉庫
```bash
git clone https://github.com/s987654321052-hub/RemoteAI-Guardian.git
cd RemoteAI-Guardian
```

### 步驟 2: 安裝依賴
```bash
cd auth-system
npm install
```

### 步驟 3: 配置環境
```bash
cp .env.example .env
# 編輯 .env 文件，添加 LINE 配置和 Tailscale IP
```

### 步驟 4: 啟動服務
```bash
npm start
```

### 步驟 5: 配置 iPhone 訪問
1. 在 iPhone 上安裝 Tailscale
2. 連接到 Tailscale 網絡
3. 在 Safari 中訪問 http://your-tailscale-ip:9999

### 步驟 6: 配置 LINE
1. 在 LINE Developers Console 創建 Official Account
2. 設置 Webhook URL
3. 在 .env 中配置 LINE 令牌

## 📞 支持

- 📖 查看完整文檔
- 🐛 報告 Bug
- 💡 建議功能改進

---

**享受遠程控制！** 🚀
