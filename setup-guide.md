# RemoteAI Guardian - 第一階段完整設置指南

## 📋 目錄
1. [環境準備](#環境準備)
2. [Google Service Account 設置](#google-service-account-設置)
3. [Tailscale 配置](#tailscale-配置)
4. [認證系統安裝](#認證系統安裝)
5. [LINE 通知設置](#line-通知設置)
6. [測試與驗收](#測試與驗收)

---

## 環境準備

### 1. 安裝 Python 3.12.9

你已有 Python 3.12.9，位置：
```
下載區/python-3.12.9-amd64
```

**安裝步驟：**
```bash
# 1. 執行安裝程序
python-3.12.9-amd64.exe

# 2. 重要：勾選 "Add Python 3.12 to PATH"

# 3. 驗證安裝
python --version
# 應該顯示: Python 3.12.9
```

### 2. 檢查 Node.js

```bash
node --version
# 應該顯示: v24.13.1 (或更高)
```

### 3. 創建項目目錄

```bash
mkdir C:\RemoteAI-Guardian
cd C:\RemoteAI-Guardian
mkdir auth-system
mkdir credentials
mkdir logs
```

---

## Google Service Account 設置

### 步驟 1: 建立 Google Cloud 專案

1. 打開 Google Cloud Console
   ```
   https://console.cloud.google.com/
   ```

2. 用你的 Gmail 登入：`s987654321052@gmail.com`

3. 建立新專案
   - 點擊「Select a project」
   - 點擊「New Project」
   - 專案名稱：`RemoteAI-Guardian`
   - 點擊「Create」

4. 等待專案建立完成（通常 1-2 分鐘）

### 步驟 2: 啟用必要的 API

1. 在 Google Cloud Console，搜索並啟用以下 API：
   ```
   - Google Sheets API
   - Google Drive API
   - Gmail API
   - Google Docs API
   - Google Calendar API
   ```

2. 對於每個 API：
   - 搜索 API 名稱
   - 點擊結果
   - 點擊「Enable」

### 步驟 3: 建立 Service Account

1. 進入「APIs & Services」→「Credentials」

2. 點擊「Create Credentials」→「Service Account」

3. 填寫信息：
   ```
   Service account name: remoteai-guardian
   Service account ID: (自動生成)
   Description: RemoteAI Guardian 自動化系統
   ```

4. 點擊「Create and Continue」

5. 授予角色：
   - 角色：`Editor`（給予完整權限）
   - 點擊「Continue」

6. 點擊「Done」

### 步驟 4: 建立金鑰

1. 回到 Service Accounts 列表

2. 點擊剛剛建立的帳戶

3. 進入「Keys」分頁

4. 點擊「Add Key」→「Create new key」

5. 選擇「JSON」格式

6. 點擊「Create」

7. JSON 文件會自動下載，名稱類似：
   ```
   remoteai-guardian-xxxxxxxx.json
   ```

8. **保存到：** `C:\RemoteAI-Guardian\credentials\google-key.json`

### 步驟 5: 共享 Google 資源

現在 Service Account 有了 Email，格式：
```
remoteai-guardian@remoteai-guardian-xxxxxx.iam.gserviceaccount.com
```

你需要：
1. 建立一個 Google Sheets 或 Docs
2. 右擊「Share」
3. 把 Service Account Email 添加為「Editor」
4. 這樣 AI 就有權訪問了

---

## Tailscale 配置

### 步驟 1: 安裝 Tailscale

**Windows 版本：**
```
https://tailscale.com/download/windows
```

1. 下載 `.exe` 安裝程序
2. 執行安裝
3. 完成後自動啟動

**iPhone 版本：**
```
App Store 搜尋「Tailscale」→ 安裝
```

### 步驟 2: 登入 Tailscale

**在 Windows 上：**
1. Tailscale 圖標會出現在系統托盤
2. 點擊→「Sign in」
3. 用 Google 帳號登入（s987654321052@gmail.com）
4. 授權並完成
5. 複製你的 Tailscale IP，格式：`100.xxx.xxx.xxx`

**在 iPhone 上：**
1. 打開 Tailscale App
2. 點擊「Sign in」
3. 用相同的 Google 帳號登入
4. 授權完成

### 步驟 3: 測試連接

從 iPhone 用 5G：
```
在瀏覽器輸入: http://<你的Windows Tailscale IP>:9999
（例如：http://100.123.45.67:9999）

應該能看到項目監控儀表板
```

---

## 認證系統安裝

### 步驟 1: 創建認證系統目錄

```bash
cd C:\RemoteAI-Guardian\auth-system
```

### 步驟 2: 初始化 Node.js 項目

```bash
npm init -y
npm install express uuid crypto dotenv axios
```

### 步驟 3: 建立環境配置

建立文件：`.env`

```
GOOGLE_KEY_PATH=../credentials/google-key.json
LINE_CHANNEL_ID=2009132426
LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c
LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU=
AUTH_PORT=8888
TAILSCALE_IP=<你的Windows Tailscale IP>
```

### 步驟 4: 複製認證系統代碼

（見下個文件 `auth-system.js`）

### 步驟 5: 啟動認證系統

```bash
node auth-system.js
```

應該看到：
```
🚀 認證系統已啟動
📱 蘋果配對端點: http://localhost:8888/api/pair
🔐 認證驗證端點: http://localhost:8888/api/auth
```

---

## LINE 通知設置

### 步驟 1: 複製 LINE 通知代碼

（見下個文件 `line-notifier.js`）

### 步驟 2: 測試 LINE 通知

```bash
node line-notifier.js
```

應該在 LINE 上收到測試訊息：
```
✅ RemoteAI Guardian 系統已啟動
```

---

## 測試與驗收

### 檢查清單

- [ ] Python 3.12.9 已安裝
- [ ] Google Service Account 已建立，金鑰已下載
- [ ] Tailscale 已在 Windows 和 iPhone 上安裝並登入
- [ ] 認證系統已啟動
- [ ] LINE 通知已測試
- [ ] 從 iPhone 可以通過 Tailscale IP 訪問儀表板
- [ ] 儀表板進度已更新為「第一階段: 10%」

### 故障排除

**Q: 無法登入 Google Cloud Console**
A: 確保使用正確的 Gmail: `s987654321052@gmail.com`

**Q: Service Account 金鑰下載失敗**
A: 清除瀏覽器快取，重新嘗試

**Q: Tailscale 連接不穩定**
A: 
- 重啟 Tailscale
- 確保 Windows 和 iPhone 用相同的 Google 帳號
- 檢查防火牆設置

**Q: LINE 沒有收到訊息**
A: 確認 Channel ID、Secret、Access Token 正確無誤

---

## 下一步

完成上述所有步驟後：
1. 更新儀表板進度到 25%
2. 在 LINE 上發送完成通知
3. 準備第二個任務：TLS 加密通訊

---

## 需要幫助？

遇到問題時，直接告訴我：
- 錯誤訊息
- 你執行到哪一步
- 期望的結果是什麼

我會幫你解決。
