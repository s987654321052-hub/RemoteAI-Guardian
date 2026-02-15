# 🎯 快速測試 LINE 指令功能 - 5 分鐘指南

## ✅ 前置條件確認

你已經有：
- ✅ 完整的應用代碼（auth-system）
- ✅ npm 依賴已安裝
- ✅ .env 配置已完成（LINE 令牌等）
- ✅ Node.js 已安裝

---

## 🚀 立即測試（3 個步驟）

### 步驟 1️⃣：啟動認證系統

打開 **PowerShell 或 cmd**，進入項目目錄：

```powershell
cd C:\RemoteAI-Guardian\auth-system
npm start
```

你應該看到：
```
🚀 認證系統已啟動（簡化版）
📱 蘋果配對端點: http://localhost:8888/api/pair/request
🔐 認證驗證端點: http://localhost:8888/api/auth/verify
🔄 令牌刷新端點: http://localhost:8888/api/auth/refresh
📋 設備列表: http://localhost:8888/api/devices
📊 狀態端點: http://localhost:8888/api/status
📋 日誌端點: http://localhost:8888/api/logs

✅ LINE 通知已啟用
```

### 步驟 2️⃣：啟動 LINE 命令處理器

打開 **第二個 PowerShell/cmd 終端**：

```powershell
cd C:\RemoteAI-Guardian\auth-system
node line-command-handler.js
```

你應該看到：
```
🚀 LINE 命令處理器已啟動，端口: 3001
📍 Webhook URL: http://localhost:3001/webhook/line
✅ 已初始化 LINE 命令處理器
```

### 步驟 3️⃣：在 LINE 上測試命令

現在打開你的 **LINE 應用**，在個人帳戶上傳送以下命令：

#### 測試 1：檢查系統狀態
```
status
```

**預期回應：**
```
✅ 系統狀態

狀態: ✅ 運行中
已配對設備: 0
活躍令牌: 0
啟動時間: [時間戳]

Tailscale 訪問:
🌐 儀表板: http://100.127.44.67:9999

⏰ 當前時間: [當前時間]
```

#### 測試 2：查看幫助
```
help
```

**預期回應：**
```
📚 RemoteAI Guardian - 命令幫助

可用命令:

• help - 顯示幫助信息
• status - 檢查系統狀態
• list - 列出所有任務
• run - 執行命令 (格式: run <command>)
• stop - 停止任務 (格式: stop <task-id>)
• devices - 列出配對設備
• stats - 系統資源統計
...
```

#### 測試 3：列出正在運行的容器
```
run docker ps
```

**預期回應：**
```
✅ 命令執行成功

任務 ID: xxxxxxxx
請查看 LINE 通知了解詳細結果

然後會收到：
📊 任務進度更新

任務 ID: xxxxxxxx
狀態: ✅ 已完成
進度: 100% ██████████

命令: docker ps

輸出:
(容器列表輸出)
```

#### 測試 4：執行任意 Windows 命令
```
run dir
```

或：
```
run tasklist
```

或：
```
run ipconfig
```

---

## 🔍 調試 - 如果出現問題

### ❌ LINE 沒有收到回應？

#### 檢查 1：驗證 .env 配置

```powershell
# 查看 LINE 配置
cd C:\RemoteAI-Guardian
Get-Content .env | findstr /C:"LINE_"
```

你應該看到：
```
LINE_CHANNEL_ID=2009132426
LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c
LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/...
LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc
```

如果缺少任何配置，去 [LINE Developers Console](https://developers.line.biz/console/) 獲取。

#### 檢查 2：驗證 LINE 連接

在 **PowerShell** 中運行：

```powershell
$token = "tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU="
$userId = "Uee2657aac9ffdc9d6d63f7e5097c0bbc"

$body = @{
  to = $userId
  messages = @(@{
    type = "text"
    text = "🧪 測試訊息"
  })
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.line.biz/v3/bot/message/push" `
  -Method Post `
  -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} `
  -Body $body
```

如果返回 200，表示 LINE 連接成功。

#### 檢查 3：查看應用日誌

在認證系統的終端中查看是否有 error：
```
grep -i error logs/*
```

### ❌ 命令執行失敗？

檢查端口是否被佔用：

```powershell
# 查看端口 8888 和 3001
netstat -ano | findstr :8888
netstat -ano | findstr :3001
```

如果已被佔用，kill 進程或改變端口：

```powershell
# 修改 .env
# 將 AUTH_PORT=8888 改為 AUTH_PORT=8889
# 將 LINE_WEBHOOK_PORT=3001 改為 LINE_WEBHOOK_PORT=3002
```

---

## 📊 測試進度表

在終端中逐一執行並檢查：

| 測試項 | 命令 | 預期結果 | 狀態 |
|--------|------|--------|------|
| 認證系統啟動 | `npm start` | 顯示 "🚀 已啟動" | ✅ |
| LINE 處理器啟動 | `node line-command-handler.js` | 顯示 "🚀 已啟動" | ✅ |
| LINE 連接測試 | 在 LINE 發送 `help` | 收到幫助信息 | ✅ |
| 狀態檢查 | 發送 `status` | 收到系統狀態 | ✅ |
| 命令執行 | 發送 `run dir` | 收到目錄列表 | ✅ |
| 進度報告 | 發送 `run tasklist` | 收到進度條和結果 | ✅ |

---

## 💡 常用 LINE 命令速查

### 信息查詢

```
help                    # 幫助信息
status                  # 系統狀態
devices                 # 列出設備
list                    # 任務列表
stats                   # 資源統計
```

### 命令執行

```
run docker ps           # 列出容器
run docker logs nginx   # 查看 nginx 日誌
run npm start           # 啟動服務
run tasklist            # 任務列表
run dir C:\             # 列出 C 盤
run ipconfig            # 網絡配置
```

### 進度控制

```
stop <task-id>          # 停止任務
list                    # 查看進行中的任務
```

---

## 🎯 關鍵特性演示

### 1. 自然語言命令
LINE 上輸入任何 Windows/Docker 命令，系統會：
- ✅ 解析命令
- ✅ 執行操作
- ✅ 返回進度條
- ✅ 發送完整結果

### 2. 實時進度報告
長時間運行的命令會收到：
```
📊 任務進度更新

任務 ID: xxxxxxxx
狀態: ⚙️ 進行中
進度: 45% ████░░░░░░
```

### 3. 任務隊列管理
```
list
```
查看所有任務的狀態和進度。

### 4. 錯誤處理
命令失敗時會收到詳細錯誤信息：
```
❌ 命令執行失敗

任務 ID: xxxxxxxx
命令: run invalid-cmd

錯誤:
'invalid-cmd' 不是內部或外部命令
```

---

## 🔐 安全性檢查

系統已配置：

✅ **用戶驗證**
- 只有 `LINE_USER_ID` 配置的用戶才能執行命令
- 未授權用戶會被拒絕

✅ **令牌管理**
- LINE 訪問令牌已安全存儲
- 每條命令驗證令牌有效性

✅ **日誌記錄**
- 所有命令都被記錄
- 可查看執行歷史

---

## 📞 故障排查快速鏈接

| 問題 | 解決方案 |
|------|--------|
| LINE 無法連接 | 查看 `.env` 中的 `LINE_ACCESS_TOKEN` |
| 命令無法執行 | 檢查端口 8888 和 3001 未被占用 |
| 進度條未顯示 | 確保 npm 依賴已完整安裝 |
| 沒有收到回應 | 查看終端日誌尋找 error 信息 |
| 用戶拒絕訪問 | 驗證 `LINE_USER_ID` 配置正確 |

---

## ✅ 完成！

現在你可以：
1. ✅ 在 LINE 上發送命令
2. ✅ 實時查看執行進度
3. ✅ 控制遠程系統
4. ✅ 自動接收執行結果

**下一步建議：**
- [ ] 啟動 iPhone 儀表板：`node iphone-dashboard.js`
- [ ] 測試 iOS 原生應用
- [ ] 配置自動化任務
- [ ] 設置監控告警

---

**快樂遠程控制！** 🚀

*有問題？查看 `IMPLEMENTATION_COMPLETE.md` 和 `QUICK_REFERENCE.md`*
