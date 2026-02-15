# 🚀 Railway 部署 - 完整指南

## 📋 Railway vs Heroku

| 特性 | Railway | Heroku |
|------|---------|--------|
| 免費 | ✅ 完全免費 | ❌ 需卡片 |
| 休眠 | ❌ 無休眠 | ✅ 30分鐘休眠 |
| HTTPS | ✅ 自動 | ✅ 自動 |
| 部署速度 | ⚡ 快 | 🐢 慢 |
| 文檔 | 📚 完善 | 📚 完善 |

**Railway 更適合你！** 無需卡片，24/7 運行。

---

## 🚀 3 步快速部署

### 步驟 1️⃣：進入 Railway（1 分鐘）

1. 打開 https://railway.app
2. 點擊右上角 **Login**
3. 選擇 **GitHub** 或 **Google** 登入

---

### 步驟 2️⃣：創建項目（2 分鐘）

#### 方式 A：使用 GitHub（推薦）

1. 點擊 **Create Project**
2. 選擇 **Deploy from GitHub repo**
3. 授權 GitHub 連接
4. 搜尋 **RemoteAI-Guardian** 倉庫
5. 選擇並點擊 **Deploy**

#### 方式 B：直接上傳文件夾

1. 點擊 **Create Project**
2. 選擇 **Deploy from Git**
3. 上傳 C:\RemoteAI-Guardian 文件夾

---

### 步驟 3️⃣：配置環境變量（2 分鐘）

部署完成後：

1. 進入 Railway 儀表板
2. 找到你的項目
3. 點擊 **Variables** 標籤
4. 點擊 **+ New Variable**

**逐個添加這些變量：**

```
KEY: LINE_CHANNEL_ID
VALUE: 2009132426
```

```
KEY: LINE_CHANNEL_SECRET
VALUE: 8ec86e5781c1e3df454caf94eafb235c
```

```
KEY: LINE_ACCESS_TOKEN
VALUE: tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU=
```

```
KEY: LINE_USER_ID
VALUE: Uee2657aac9ffdc9d6d63f7e5097c0bbc
```

每添加一個都點擊 **Add Variable**

---

## 📊 自動獲得 Webhook URL

變量添加完成後，Railway 會自動顯示你的應用 URL：

```
https://your-project.up.railway.app
```

你的 **Webhook URL** 是：

```
https://your-project.up.railway.app/webhook/line
```

---

## 🔧 在 LINE 中配置

1. 進入 [LINE Developers Console](https://developers.line.biz/console/)
2. **Messaging API** → **Webhook settings**
3. **Webhook URL** 填入上面的 URL
4. 點擊 **Save** → **Verify**

應該看到 ✅ 綠色提示

---

## 📱 測試

在手機 LINE 上發送：

```
ping
```

**預期回應：**

```
🏓 Pong! 連接正常
```

---

## ⏱️ 總時間

| 步驟 | 時間 |
|------|------|
| 登入 Railway | 1 分鐘 |
| 創建項目 | 2 分鐘 |
| 配置變量 | 2 分鐘 |
| 自動部署 | 2-3 分鐘 |
| LINE 配置 | 1 分鐘 |
| **總計** | **8-10 分鐘** |

---

## 🎯 下一步

**立即開始：**

1. 打開 https://railway.app
2. 用 GitHub/Google 登入
3. 創建項目
4. 添加環境變量
5. 獲得 URL
6. 在 LINE 中配置

**就這麼簡單！** 🚀

---

## 💡 Railway 的優勢

✅ **無需信用卡** - 完全免費
✅ **無休眠** - 24/7 運行
✅ **快速部署** - 2-3 分鐘
✅ **自動 HTTPS** - 開箱即用
✅ **簡單配置** - UI 友好

---

## 📞 如果有問題

### 部署失敗

查看 Railway 儀表板的 **Logs** 標籤查看錯誤信息

### Webhook 驗證失敗

- ✅ URL 是否正確（https 開頭）
- ✅ 應用是否正常運行（Railway 儀表板）
- ✅ 環境變量是否已設置

### 需要重新部署

1. 進入 Railway 儀表板
2. 點擊 **Deployments**
3. 點擊 **Redeploy** 按鈕

---

## 🎉 完成後

部署成功後你可以：

✅ 在手機 LINE 上控制系統
✅ 執行任意 Windows 命令
✅ 24/7 運行（無休眠）
✅ 完全免費

---

**現在就進入 https://railway.app 開始吧！** 🚀
