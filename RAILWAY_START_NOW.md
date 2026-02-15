# 🚀 Railway 部署 - 立即開始（5 分鐘）

## ✅ 已準備就緒

- ✅ 代碼已提交到 Git
- ✅ Procfile 已配置
- ✅ package.json 已準備

---

## 🎯 現在只需 3 步

### 步驟 1️⃣：進入 Railway（1 分鐘）

打開 https://railway.app

點擊右上角 **Login**

用 **GitHub** 或 **Google** 登入（免費）

---

### 步驟 2️⃣：創建項目並配置（5 分鐘）

#### A. 創建項目

1. 點擊 **Create Project**
2. 選擇 **Deploy from Git** 或 **GitHub repo**
3. 如果選 GitHub：授權並選擇 RemoteAI-Guardian 倉庫
4. 點擊 **Deploy**

#### B. 配置環境變量

部署完成後：

1. 進入你的項目
2. 點擊 **Variables** 標籤
3. 添加這 4 個變量：

| KEY | VALUE |
|-----|-------|
| LINE_CHANNEL_ID | 2009132426 |
| LINE_CHANNEL_SECRET | 8ec86e5781c1e3df454caf94eafb235c |
| LINE_ACCESS_TOKEN | tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU= |
| LINE_USER_ID | Uee2657aac9ffdc9d6d63f7e5097c0bbc |

**每添加一個點 "Add Variable"**

---

### 步驟 3️⃣：在 LINE 中配置 Webhook（2 分鐘）

部署完成後，Railway 會顯示你的應用 URL：

```
https://your-app.up.railway.app
```

**Webhook URL 是：**

```
https://your-app.up.railway.app/webhook/line
```

**在 LINE Developers Console 中：**

1. 進入 https://developers.line.biz/console/
2. **Messaging API** → **Webhook settings**
3. 貼入上面的 URL
4. 點擊 **Save** → **Verify**

應該看到 ✅ 綠色提示

---

## 📱 測試

打開手機 LINE，在個人帳號發送：

```
ping
```

**預期回應：**

```
🏓 Pong! 連接正常
```

---

## 🎊 完成！

現在你可以在手機 LINE 上使用 RemoteAI Guardian！

**試試這些命令：**

```
help              幫助
status            系統狀態
run dir           列出目錄
run tasklist      進程列表
run docker ps     Docker 容器
```

---

## 📊 進度檢查

✅ 本地系統 - 完全就緒
✅ 代碼提交到 Git - 完成
⏳ Railway 部署 - 現在進行
⏳ LINE 配置 - 部署後完成

---

## 💡 Railway 優勢

vs Heroku：
- ✅ 無需信用卡
- ✅ 無休眠（24/7 運行）
- ✅ 部署更快
- ✅ 完全免費

---

## 🎯 立即開始

1. **打開** https://railway.app
2. **登入**（GitHub/Google）
3. **創建項目**（部署）
4. **添加環境變量**
5. **在 LINE 配置**
6. **完成！**

**總共 8-10 分鐘即可在手機上使用！** 🚀

---

## 📞 需要幫助？

查看 `RAILWAY_DEPLOYMENT.md` 了解完整步驟

---

**現在就進入 Railway 吧！** 💪

https://railway.app
