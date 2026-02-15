# RemoteAI Guardian - iPhone 和 LINE 完整設置指南

## 📋 目錄

1. [快速開始](#快速開始)
2. [LINE 通知配置](#line-通知配置)
3. [iPhone Safari 訪問](#iphone-safari-訪問)
4. [iOS 原生應用](#ios-原生應用)
5. [Tailscale 設置](#tailscale-設置)
6. [LINE 命令大全](#line-命令大全)
7. [故障排除](#故障排除)

---

## 🚀 快速開始

### 第一步：啟動完整系統

```bash
cd C:\RemoteAI-Guardian\auth-system

# 安裝依賴（如果尚未安裝）
npm install

# 啟動所有服務
npm start
```

這會同時啟動：
- ✅ 認證系統（端口 8888）
- ✅ iPhone Web 儀表板（端口 9999）
- ✅ LINE 命令處理器（需要另外啟動）

### 第二步：啟動 LINE 命令處理器

**新開一個命令行視窗：**

```bash
cd C:\RemoteAI-Guardian\auth-system
node line-command-handler.js
```

你應該看到：
```
🚀 LINE 命令處理器已啟動，端口: 3001
📍 Webhook URL: http://localhost:3001/webhook/line
✅ 已初始化 LINE 命令處理器
```

---

## 📱 LINE 通知配置

### 步驟 1：建立 LINE Official Account

1. 前往 [LINE Developers Console](https://developers.line.biz/zh-hant/)
2. 點擊「開始使用」
3. 建立「商業帳戶」或「開發人員帳戶」
4. 建立新的「Channel」（選擇「Messaging API」）

### 步驟 2：取得必需的密鑰

在 LINE Developers Console 中：

1. **Channel Secret** - 在「Basic settings」中
2. **Channel ID** - 在「Basic settings」中
3. **Access Token** - 在「Messaging API」選項卡中，點擊「Issue」生成

### 步驟 3：設置個人 LINE 帳號為官方帳號管理員

1. 掃描你 Channel 的 QR Code
2. 添加官方帳號為好友
3. 在 Channel 中發送任何訊息
4. 從你的 `.env` 中複製 `LINE_USER_ID`

### 步驟 4：更新 .env 文件

編輯 `C:\RemoteAI-Guardian\.env`：

```env
# LINE 通知配置
LINE_CHANNEL_ID=your_channel_id
LINE_CHANNEL_SECRET=your_channel_secret
LINE_ACCESS_TOKEN=your_access_token
LINE_USER_ID=your_user_id
```

### 步驟 5：設置 Webhook URL

在 LINE Developers Console 中：

1. 前往「Messaging API」選項卡
2. 在「Webhook settings」中
3. 設置 Webhook URL 為：

**本地測試：**
```
http://localhost:3001/webhook/line
```

**生產環境（使用 Tailscale）：**
```
http://<你的Tailscale-IP>:3001/webhook/line
```

4. 點擊「Verify」測試連接
5. 啟用「Use webhook」

---

## 🌐 iPhone Safari 訪問

### 步驟 1：確保 Tailscale 連接

**Windows 上：**
```bash
# 啟動 Tailscale
tailscale up

# 檢查你的 IP
tailscale ip -4
```

**iPhone 上：**
1. 打開 App Store，搜索「Tailscale」
2. 安裝並登錄
3. 連接到 Tailscale 網絡

### 步驟 2：在 iPhone Safari 中訪問

打開 Safari 並訪問：

```
http://<你的Tailscale-Windows-IP>:9999
```

例如：
```
http://100.127.44.67:9999
```

### 步驟 3：保存為主屏幕快捷方式

1. 在 Safari 中訪問儀表板
2. 點擊下方的「分享」按鈕
3. 選擇「加入主屏幕」
4. 確認添加

現在你可以像原生應用一樣快速訪問儀表板！

---

## 📲 iOS 原生應用

### 在 Xcode 中打開項目

1. **打開 Xcode**
2. **File → Open** → 選擇 `C:\RemoteAI-Guardian\iOS`
3. **選中 Xcode 項目文件**

### 配置項目

1. 選擇「RemoteAI Guardian」項目
2. 在「Signing & Capabilities」中
3. 選擇你的 Team
4. 修改 Bundle Identifier（例如：`com.yourname.remoteai-guardian`）

### 修改 API 端點

編輯 `RemoteAIGuardianApp.swift` 文件，第 257 行：

```swift
private let apiBaseURL = "http://<你的Tailscale-IP>:9999"
```

改為：

```swift
private let apiBaseURL = "http://100.127.44.67:9999"
```

### 構建和部署

1. **連接 iPhone** 到 Mac
2. **選擇設備** - 在頂部欄選擇你的 iPhone
3. **點擊 Run** （或按 Cmd+R）
4. **等待構建完成**
5. **允許應用在 iPhone 上運行**

應用會在你的 iPhone 上啟動，並自動連接到儀表板！

---

## 🔗 Tailscale 設置

### Windows 上配置 Tailscale

```bash
# 1. 下載並安裝 Tailscale
# 前往 https://tailscale.com/download/windows

# 2. 啟動 Tailscale
tailscale up

# 3. 獲取你的 IP
tailscale ip -4
```

記住輸出的 IP 地址，例如：`100.127.44.67`

### 更新 .env 文件

```env
TAILSCALE_IP=100.127.44.67
TAILSCALE_PHONE_IP=100.103.60.73
```

### 檢查連接

```bash
# 測試 Windows 到 iPhone 的連接
ping 100.103.60.73

# 測試儀表板訪問
curl http://100.127.44.67:9999/health
```

---

## 💬 LINE 命令大全

### 系統信息命令

```
help         - 顯示幫助信息
status       - 檢查系統狀態
devices      - 列出配對設備
stats        - 系統資源統計
list         - 列出所有任務
```

### 命令執行

```
run docker ps              - 列出運行中的容器
run docker ps -a          - 列出所有容器
run docker logs <name>    - 查看容器日誌
run docker stats          - 實時監控資源
run docker restart <name> - 重啟容器
```

### 任務管理

```
run npm start              - 啟動服務
run npm stop               - 停止服務
stop <task-id>             - 停止指定任務
```

### 文件操作

```
run dir                    - 列出當前目錄
run dir C:\path\to\dir    - 列出指定目錄
run type C:\file.txt      - 查看文件內容
```

### 示例用法

**查詢系統狀態：**
```
在 LINE 上傳送：status
```

**執行 Docker 命令：**
```
在 LINE 上傳送：run docker ps -a
```

**查看系統統計：**
```
在 LINE 上傳送：stats
```

---

## 🔔 LINE 通知示例

### 設備配對完成

```
✅ 新設備已配對

📱 設備: iPhone 13 Pro
🔑 令牌有效期: 24 小時
⏰ 時間: 2026/02/15 下午 2:30:45
```

### 命令執行成功

```
✅ 命令執行成功

任務 ID: a1b2c3d4
命令: docker ps

輸出:
CONTAINER ID   IMAGE     COMMAND
abc123def456   nginx     "nginx"
xyz789uvw012   redis     "redis-server"

⏰ 時間: 2026/02/15 下午 2:35:12
```

### 執行進度更新

```
📊 任務進度更新

任務 ID: task-001
狀態: ⚙️ 進行中
進度: 50% ██████░░

正在下載依賴...

⏰ 時間: 2026/02/15 下午 2:40:00
```

---

## 🐛 故障排除

### LINE 訊息無法接收

**問題：** 在 LINE 上傳送訊息後沒有回應

**解決方案：**

1. 確認 Webhook URL 已設置正確
   ```bash
   # 測試 Webhook 連接
   curl http://localhost:3001/health
   ```

2. 檢查 LINE 命令處理器是否運行
   ```bash
   # 查看進程
   tasklist | findstr "node"
   ```

3. 查看日誌
   ```bash
   # 查看最近的日誌
   more logs/remoteai-*.log
   ```

### iPhone Safari 無法訪問儀表板

**問題：** 在 iPhone Safari 中無法連接到 `http://100.127.44.67:9999`

**解決方案：**

1. 檢查 Tailscale 連接
   ```bash
   # 在 iPhone 上打開 Tailscale 應用，確認已連接
   ```

2. 檢查 Windows 防火牆
   ```bash
   # 允許端口 9999 通過防火牆
   netsh advfirewall firewall add rule name="RemoteAI Dashboard" dir=in action=allow protocol=tcp localport=9999
   ```

3. 測試連接
   ```bash
   # 在 Windows 上
   curl http://localhost:9999/health
   
   # 在 iPhone 上（使用 SSH）
   ssh user@100.127.44.67 "curl http://localhost:9999/health"
   ```

### iOS 應用無法連接

**問題：** iOS 原生應用顯示「系統離線」

**解決方案：**

1. 檢查 API 端點配置
   - 編輯 `RemoteAIGuardianApp.swift`
   - 確認 `apiBaseURL` 是正確的 IP

2. 檢查防火牆規則
   ```bash
   # Windows Defender Firewall
   netsh advfirewall firewall show rule name="RemoteAI Dashboard"
   ```

3. 重新構建應用
   ```bash
   # 在 Xcode 中
   Cmd + Shift + K  # Clean
   Cmd + B          # Build
   ```

### 命令執行超時

**問題：** 執行命令後長時間沒有回應

**解決方案：**

1. 增加超時時間
   - 編輯 `line-command-handler.js`
   - 修改 `timeout: 60000` 為更大的值

2. 檢查命令是否有效
   ```bash
   # 直接在 Windows 上測試命令
   docker ps -a
   ```

3. 查看任務隊列
   ```bash
   # 在 LINE 上傳送
   list
   ```

---

## ✅ 完整檢查清單

設置完成後，確認所有項目：

- [ ] 認證系統已啟動（端口 8888）
- [ ] iPhone 儀表板已啟動（端口 9999）
- [ ] LINE 命令處理器已啟動（端口 3001）
- [ ] Tailscale 已在 Windows 和 iPhone 上連接
- [ ] LINE Official Account 已配置
- [ ] Webhook URL 已設置並驗證
- [ ] iPhone Safari 可以訪問儀表板
- [ ] 可以在 LINE 上接收回應
- [ ] iOS 原生應用已部署到 iPhone
- [ ] 所有命令在 LINE 上正常工作

---

## 📞 支持和聯繫

遇到問題？

1. **查看日誌**
   ```bash
   more logs/remoteai-*.log
   node test-line-simulator.js
   ```

2. **測試 LINE 連接**
   ```bash
   node test-line-notifications.js
   ```

3. **檢查系統狀態**
   ```bash
   curl http://localhost:8888/api/status
   ```

---

**最後更新**: 2026/02/15  
**版本**: 1.0.0 完整版  
**狀態**: ✅ iPhone + LINE 完全整合
