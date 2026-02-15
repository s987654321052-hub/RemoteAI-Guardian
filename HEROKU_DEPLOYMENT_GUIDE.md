# 🚀 Heroku 部署完整指南

## 📋 部署步驟

### 步驟 1️⃣：準備 Heroku 帳號

1. 打開 https://www.heroku.com
2. 點擊 **Sign Up**
3. 用 Email 註冊（免費）
4. 驗證 Email
5. 設置密碼

**完成時間：2 分鐘**

---

### 步驟 2️⃣：安裝 Heroku CLI

#### Windows 上安裝

**方式 A：用 npm 安裝（推薦）**

```powershell
npm install -g heroku
```

**方式 B：下載安裝程式**

進入 https://devcenter.heroku.com/articles/heroku-cli
下載 Windows 版本，雙擊安裝

**驗證安裝：**

```powershell
heroku --version
```

應該顯示版本號

**完成時間：3 分鐘**

---

### 步驟 3️⃣：登入 Heroku

```powershell
heroku login
```

會打開瀏覽器，按「Log In」

**完成時間：1 分鐘**

---

### 步驟 4️⃣：創建 Heroku 應用

```powershell
cd C:\RemoteAI-Guardian

# 創建 Heroku 應用（應用名稱必須唯一）
heroku create remoteai-guardian-yourname

# 例如：
# heroku create remoteai-guardian-2026
```

**完成時間：1 分鐘**

---

### 步驟 5️⃣：配置環境變量

```powershell
# 設置 LINE 配置
heroku config:set LINE_CHANNEL_ID=2009132426
heroku config:set LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c
heroku config:set LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU=
heroku config:set LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc
```

**完成時間：1 分鐘**

---

### 步驟 6️⃣：部署代碼

```powershell
# 初始化 Git 倉庫
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit"

# 添加 Heroku 遠程倉庫
heroku git:remote -a remoteai-guardian-yourname

# 部署
git push heroku main
```

**完成時間：2-5 分鐘（取決於網絡）**

---

### 步驟 7️⃣：在 LINE Developers Console 配置 Webhook

1. 進入 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel
3. **Messaging API** → **Webhook settings**
4. **Webhook URL** 填入：
   ```
   https://remoteai-guardian-yourname.herokuapp.com/webhook/line
   ```
5. 點擊 **Save** → **Verify**

**應該看到：** ✅ 綠色提示

**完成時間：1 分鐘**

---

### 步驟 8️⃣：在手機 LINE 上測試

在你的 **LINE 個人帳號** 發送：

```
ping
```

**預期回應：** `🏓 Pong! 連接正常`

---

## 📊 完整流程時間表

| 步驟 | 時間 | 內容 |
|------|------|------|
| 1 | 2 分鐘 | 註冊 Heroku |
| 2 | 3 分鐘 | 安裝 CLI |
| 3 | 1 分鐘 | 登入 Heroku |
| 4 | 1 分鐘 | 創建應用 |
| 5 | 1 分鐘 | 環境變量 |
| 6 | 5 分鐘 | 部署代碼 |
| 7 | 1 分鐘 | 配置 Webhook |
| 8 | 1 分鐘 | 測試 |
| **總計** | **15 分鐘** | **完成！** |

---

## 🔧 Procfile（已準備）

需要在項目根目錄創建 `Procfile` 文件：

```
web: node auth-system/line-webhook-simple.js
```

---

## ⚠️ 注意事項

### 免費 Heroku 的限制
- ✅ 完全免費
- ❌ 30 分鐘無請求會自動休眠
- ❌ 一個月只有 550 小時（共約 23 天）

### 解決方案
如果需要 24/7 運行，可以：
1. 升級到付費計畫（$7/月起）
2. 或使用便宜 VPS（$5/月）

---

## 🚀 快速命令參考

```powershell
# 1. 安裝 Heroku CLI
npm install -g heroku

# 2. 登入
heroku login

# 3. 創建應用
heroku create remoteai-guardian-yourname

# 4. 設置環境變量
heroku config:set LINE_CHANNEL_ID=2009132426
heroku config:set LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c
heroku config:set LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU=
heroku config:set LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc

# 5. 部署
cd C:\RemoteAI-Guardian
git init
git add .
git commit -m "Initial"
heroku git:remote -a remoteai-guardian-yourname
git push heroku main

# 6. 查看日誌
heroku logs --tail

# 7. 查看應用狀態
heroku ps
```

---

## 💡 部署後的 Webhook URL

部署成功後，你的 Webhook URL 會是：

```
https://remoteai-guardian-yourname.herokuapp.com/webhook/line
```

在 LINE Developers Console 中使用這個 URL。

---

## ✅ 成功標誌

部署成功會看到：

1. ✅ `git push heroku main` 完成，顯示 `deployed to Heroku`
2. ✅ Heroku 應用頁面可以訪問（綠色指示燈）
3. ✅ LINE Webhook 驗證通過（綠色提示）
4. ✅ 手機 LINE 能收到回應

---

## 🆘 常見問題

### 問題：部署失敗，顯示 "missing Procfile"

**解決：** 確保 Procfile 在項目根目錄

```powershell
cd C:\RemoteAI-Guardian
echo "web: node auth-system/line-webhook-simple.js" > Procfile
git add Procfile
git commit -m "Add Procfile"
git push heroku main
```

### 問題：LINE Webhook 驗證失敗

**檢查清單：**
- ✅ Webhook URL 是否正確（https 開頭）
- ✅ 應用是否已部署（heroku ps）
- ✅ 環境變量是否已設置（heroku config）

### 問題：應用自動休眠

這是免費方案的正常行為，無法避免。

---

## 🎯 現在就開始吧！

1. **註冊 Heroku**（2 分鐘）
2. **安裝 CLI**（3 分鐘）
3. **一鍵部署**（5 分鐘）
4. **在手機上測試**（1 分鐘）

**總共 15 分鐘即可在手機上使用！** 🚀

---

準備好了嗎？開始第 1 步吧！
