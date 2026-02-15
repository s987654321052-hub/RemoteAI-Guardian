# 🚀 Heroku 部署 - 完整步驟指南

## ⚠️ 前置準備

✅ Heroku CLI 已安裝
❌ Heroku 帳號登入（需要你手動完成）

---

## 📋 3 個簡單步驟

### 步驟 1️⃣：登入 Heroku（1 分鐘）

在 PowerShell 中運行：

```powershell
heroku login
```

這會打開瀏覽器讓你登入。登入後關閉瀏覽器即可。

---

### 步驟 2️⃣：運行自動部署腳本（5 分鐘）

在 PowerShell 中運行：

```powershell
cd C:\RemoteAI-Guardian
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\deploy-heroku.ps1
```

**腳本會：**
- ✅ 自動生成應用名稱
- ✅ 創建 Heroku 應用
- ✅ 設置環境變量
- ✅ 部署代碼

---

### 步驟 3️⃣：在 LINE 中配置 Webhook（2 分鐘）

部署成功後，你會看到：

```
📍 Webhook URL:
   https://remoteai-guardian-xxxxx.herokuapp.com/webhook/line
```

**複製此 URL 到 LINE Developers Console：**

1. 進入 https://developers.line.biz/console/
2. 選擇你的 Channel
3. **Messaging API** → **Webhook settings**
4. 在 **Webhook URL** 中貼入上面的 URL
5. 點擊 **Save** → **Verify**

應該看到 ✅ 綠色提示

---

## 🎯 手動部署（如果腳本有問題）

### 命令 1：初始化 Git

```powershell
cd C:\RemoteAI-Guardian
git init
git add .
git commit -m "Initial deployment"
```

### 命令 2：創建 Heroku 應用

```powershell
# 用唯一的應用名稱替換 remoteai-guardian-2026
heroku create remoteai-guardian-2026
```

### 命令 3：設置環境變量

```powershell
# 複製整個代碼塊運行
heroku config:set `
  LINE_CHANNEL_ID=2009132426 `
  LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c `
  LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU= `
  LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc
```

### 命令 4：部署

```powershell
git push heroku main
```

---

## ✅ 部署成功的標誌

看到以下信息說明成功：

```
Deployed to Heroku
https://remoteai-guardian-2026.herokuapp.com/ deployed to Heroku
```

---

## 🧪 測試部署

部署後，在手機 LINE 上試試：

```
ping
```

**預期回應：**
```
🏓 Pong! 連接正常
```

---

## 📊 總時間

| 步驟 | 時間 |
|------|------|
| 登入 Heroku | 1 分鐘 |
| 運行部署腳本 | 5 分鐘 |
| LINE Webhook 配置 | 2 分鐘 |
| **總計** | **8 分鐘** |

---

## ⚠️ 常見問題

### 應用名稱已被使用

**解決：** 用不同的名稱試試

```powershell
heroku create remoteai-guardian-yourname-2026
```

### Webhook 驗證失敗

**檢查：**
1. 應用是否已部署（heroku ps）
2. Webhook URL 是否正確（https 開頭）
3. 環境變量是否已設置（heroku config）

### 部署失敗

**查看日誌：**

```powershell
heroku logs --tail --app=remoteai-guardian-2026
```

---

## 🚀 準備好了嗎？

**立即開始：**

```powershell
heroku login
```

然後運行部署腳本或手動命令。

**有問題？** 查看上面的常見問題部分。

---

**現在就開始吧！** 🎉
