# 🎯 Heroku 部署 - 立即開始

## ✅ 已準備完成

- ✅ Heroku CLI 已安裝
- ✅ Procfile 已創建
- ✅ package.json 已配置
- ✅ 部署腳本已準備

---

## 🚀 立即部署（5 分鐘）

### 步驟 1：登入 Heroku

在 PowerShell 中運行：

```powershell
heroku login
```

**會打開瀏覽器，按 Log In 按鈕完成登入。**

---

### 步驟 2：一鍵部署

登入後，運行：

```powershell
cd C:\RemoteAI-Guardian
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
.\deploy-heroku.ps1
```

**腳本會自動：**
- 生成唯一的應用名稱
- 創建 Heroku 應用
- 設置 LINE 配置
- 部署代碼

---

### 步驟 3：獲得 Webhook URL

部署完成後，你會看到：

```
📍 Webhook URL:
   https://remoteai-guardian-xxxxx.herokuapp.com/webhook/line
```

**複製此 URL**

---

### 步驟 4：在 LINE 中配置

1. 進入 [LINE Developers Console](https://developers.line.biz/console/)
2. **Messaging API** → **Webhook settings**
3. 粘貼上面的 URL
4. 點擊 **Save** → **Verify**

應該看到 ✅ 綠色提示

---

### 步驟 5：在手機上測試

在你的 LINE 個人帳號發送：

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
ping                  連接測試
help                  幫助
status                系統狀態
run docker ps         Docker 容器
run tasklist         進程列表
run dir              列出目錄
```

---

## 🔧 如果有問題

### 問題 1：部署失敗

查看日誌：

```powershell
# 用你的應用名稱替換
heroku logs --tail --app=remoteai-guardian-xxxxx
```

### 問題 2：手動部署

如果腳本有問題，手動運行：

```powershell
cd C:\RemoteAI-Guardian
git init
git add .
git commit -m "Initial"

# 用你的應用名稱替換
heroku create remoteai-guardian-2026
heroku config:set LINE_CHANNEL_ID=2009132426 LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU= LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc

heroku git:remote -a remoteai-guardian-2026
git push heroku main
```

### 問題 3：應用名稱已被使用

用不同名稱試試：

```powershell
heroku create remoteai-guardian-yourname-2026
```

---

## 📊 部署時間表

| 步驟 | 時間 |
|------|------|
| 登入 Heroku | 1 分鐘 |
| 運行部署腳本 | 3-5 分鐘 |
| LINE 配置 | 1-2 分鐘 |
| 測試 | 1 分鐘 |
| **總計** | **6-9 分鐘** |

---

## 💡 提示

- ✅ 部署完全免費
- ✅ 30 分鐘無請求會自動休眠（正常）
- ✅ 一個月有 550 小時免費使用
- ✅ 需要 24/7 運行可升級到付費方案

---

## 🎯 下一步

1. **現在登入 Heroku**
   ```powershell
   heroku login
   ```

2. **運行部署**
   ```powershell
   cd C:\RemoteAI-Guardian
   .\deploy-heroku.ps1
   ```

3. **在 LINE 上測試**
   ```
   ping
   ```

---

**準備好了嗎？立即開始！** 🚀

不確定什麼是 Heroku？查看 `HEROKU_DEPLOYMENT_GUIDE.md`
