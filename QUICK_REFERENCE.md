# RemoteAI Guardian - 快速參考指南

## 🚀 一分鐘快速開始

### 第一次使用

```bash
# 1. 進入項目目錄
cd C:\RemoteAI-Guardian\auth-system

# 2. 安裝依賴（首次）
npm install

# 3. 雙擊啟動所有服務
C:\RemoteAI-Guardian\start-all-services.bat
```

### 訪問儀表板

**本地:**
```
http://localhost:9999
```

**iPhone (需要 Tailscale 已連接):**
```
http://100.127.44.67:9999
```

---

## 💬 LINE 快速命令

在你的個人 LINE 帳號上傳送以下命令：

```
help              查看幫助
status            系統狀態
devices           已配對設備
stats             系統統計
list              任務列表
run docker ps     執行命令
```

**例子:**
```
run docker ps -a
run docker logs nginx
```

---

## 🛠️ npm 快速命令

```bash
npm start                    # 啟動認證系統 + 儀表板
npm run line-handler         # 啟動 LINE 命令處理器
npm run dashboard            # 只啟動儀表板
npm run test-integration     # 運行完整測試
```

---

## 📱 iPhone 訪問方式

### 方式 1：Safari 網頁版（推薦）

1. **iPhone 打開 Tailscale 應用**
   - 連接到 Tailscale 網絡

2. **iPhone Safari 中訪問：**
   ```
   http://100.127.44.67:9999
   ```

3. **保存到主屏幕（可選）**
   - 分享 → 加入主屏幕 → 確認

### 方式 2：原生 iOS 應用

1. **在 Mac 上打開 Xcode**
   - File → Open → `C:\RemoteAI-Guardian\iOS`

2. **連接 iPhone**
   - 選擇設備 → Run (Cmd+R)

3. **應用會自動啟動**
   - 已集成 Tailscale 連接

---

## 🔍 常見問題快速解決

### "無法訪問儀表板"

```bash
# 1. 檢查服務是否運行
curl http://localhost:9999/health

# 2. 檢查防火牆
netsh advfirewall firewall add rule name="RemoteAI" dir=in action=allow protocol=tcp localport=9999

# 3. 檢查 Tailscale 連接
tailscale status
```

### "LINE 無法接收消息"

```bash
# 1. 檢查 Webhook 服務
curl http://localhost:3001/health

# 2. 測試 Webhook URL
# 在 LINE Developers Console 中點擊「Verify」

# 3. 檢查日誌
node test-complete-integration.js
```

### "iOS 應用無法連接"

```bash
# 1. 驗證 IP 地址
tailscale ip -4

# 2. 編輯 RemoteAIGuardianApp.swift 中的 apiBaseURL
private let apiBaseURL = "http://100.127.44.67:9999"

# 3. 重新構建應用
# Cmd+Shift+K (清理) → Cmd+B (構建) → Cmd+R (運行)
```

---

## 📊 系統架構

```
Windows PC (RemoteAI Guardian)
├── 認證系統 (port 8888)
│   └── iPhone 配對和令牌管理
├── 儀表板 (port 9999)
│   └── 響應式 Web UI + API
└── LINE 處理器 (port 3001)
    └── Webhook + 命令執行

↓ (通過 Tailscale 加密連接)

iPhone
├── Safari (Web UI)
├── Tailscale App (VPN)
└── iOS 原生應用 (可選)

↓ (LINE 官方 API)

LINE Official Account
└── 個人 LINE 帳號 (接收/傳送命令)
```

---

## 🔐 重要檔案

```
C:\RemoteAI-Guardian\
├── .env                              ← LINE 配置和密鑰
├── auth-system.js                    ← 認證系統核心
├── iphone-dashboard.js               ← Web 儀表板
├── line-command-handler.js           ← LINE 命令處理
└── iOS\
    └── RemoteAIGuardianApp.swift    ← iOS 原生應用
```

**保護 .env 文件：**
```bash
# 限制訪問權限
icacls C:\RemoteAI-Guardian\.env /grant:r %USERNAME%:F /inheritance:r
```

---

## 📞 技術支持指令

```bash
# 查看所有運行進程
tasklist | findstr node

# 停止 Node 進程
taskkill /F /IM node.exe

# 查看端口占用
netstat -ano | findstr ":8888"
netstat -ano | findstr ":9999"
netstat -ano | findstr ":3001"

# 查看 Tailscale 狀態
tailscale status

# 測試服務
curl http://localhost:8888/api/status
curl http://localhost:9999/health
curl http://localhost:3001/health
```

---

## 🎯 完整檢查清單

在部署前確認：

- [ ] Node.js 已安裝
- [ ] npm 依賴已安裝 (`npm install`)
- [ ] .env 文件已配置 (LINE 密鑰等)
- [ ] Tailscale 已在 Windows 和 iPhone 上安裝
- [ ] Tailscale 已連接
- [ ] 所有服務已啟動
- [ ] iPhone Safari 可訪問儀表板
- [ ] LINE 可接收命令
- [ ] iOS 應用可正常運行（如果使用原生應用）

---

## 💡 高級配置

### 自定義端口

編輯 `.env` 文件：

```env
AUTH_PORT=8888              # 認證系統
DASHBOARD_PORT=9999         # 儀表板
LINE_WEBHOOK_PORT=3001      # LINE 處理器
```

### 自定義命令超時

編輯 `line-command-handler.js`，約 159 行：

```javascript
timeout: 60000  // 改為 120000 表示 120 秒
```

### 啟用生產模式

編輯 `.env` 文件：

```env
NODE_ENV=production
LOG_LEVEL=warn  # 減少日誌輸出
```

---

## 🔄 更新和維護

### 更新依賴

```bash
npm update
npm audit fix
```

### 備份配置

```bash
# 備份重要文件
xcopy C:\RemoteAI-Guardian\*.env backup\ /Y
xcopy C:\RemoteAI-Guardian\credentials backup\ /Y
```

### 查看日誌

```bash
# 顯示最後 50 行日誌
Get-Content logs\* -Tail 50

# 或使用 Linux 命令
tail -50 logs/*
```

---

## 📱 iPhone 主屏快捷方式

### 步驟 1：打開儀表板

在 iPhone Safari 中訪問：
```
http://100.127.44.67:9999
```

### 步驟 2：添加到主屏幕

1. 點擊下方的分享按鈕 (↗️)
2. 選擇「加入主屏幕」
3. 編輯名稱（可選）
4. 點擊「添加」

### 步驟 3：固定應用

1. 長按主屏幕上的應用
2. 點擊「編輯主屏幕」
3. 拖動應用到想要的位置
4. 完成

---

## 🎓 學習資源

- [Tailscale 文檔](https://tailscale.com/kb/)
- [LINE Developers](https://developers.line.biz/zh-hant/)
- [Express.js 文檔](https://expressjs.com/)
- [SwiftUI 教程](https://developer.apple.com/tutorials/swiftui)

---

## 📋 版本信息

- **RemoteAI Guardian**: v1.0.0
- **Node.js**: 18.x+
- **iOS 最低版本**: 14.0+
- **iPhone Tailscale**: 最新版本

---

**最後更新**: 2026/02/15  
**文檔版本**: 1.0  
**狀態**: ✅ 完全就緒
