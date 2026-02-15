# 🔐 Google OAuth 授權指南

## ✅ 你已擁有

OAuth 客戶端憑證已保存在：
```
C:\RemoteAI-Guardian\credentials\google-oauth.json
```

包含：
- Client ID
- Client Secret
- 授權 URI
- 令牌 URI

## 🚀 授權流程

### 步驟 1: 停止認證系統（如果在運行）

如果 `npm start` 還在運行，按 `Ctrl+C` 停止

### 步驟 2: 啟動 OAuth 授權伺服器

新開一個命令行窗口，進入認證系統目錄：

```bash
cd C:\RemoteAI-Guardian\auth-system
npm run test-google-oauth
```

你會看到：
```
✅ 授權伺服器已啟動
📱 打開瀏覽器: http://localhost:8889

等待授權...
```

### 步驟 3: 在瀏覽器中授權

1. 打開瀏覽器
2. 進入：`http://localhost:8889`
3. 點擊「授權 Google 帳號」
4. 用你的 Gmail 登入：`s987654321052@gmail.com`
5. 點擊「允許」授權所有權限
6. 看到「✅ 授權成功」訊息

### 步驟 4: 驗證授權

授權完成後，你會看到：
```
✅ 令牌已保存到 ..\credentials\google-token.json
```

### 步驟 5: 重啟認證系統

回到認證系統的命令行窗口：

```bash
npm start
```

認證系統現在已連接到你的 Google 帳號！

## 📋 後續步驟

授權完成後，系統就能：

✅ 讀寫 Google Sheets
✅ 讀寫 Google Docs  
✅ 讀取 Gmail
✅ 讀寫 Google Calendar
✅ 訪問 Google Drive

## 🔍 故障排除

**Q: 授權頁面顯示錯誤**
```
A: 確保你用了正確的 Gmail: s987654321052@gmail.com
  檢查 google-oauth.json 是否存在
  檢查端口 8889 是否被佔用
```

**Q: "授權成功"後還是無法連接**
```
A: 檢查是否有 google-token.json 文件
  位置: C:\RemoteAI-Guardian\credentials\google-token.json
  如果沒有，重新授權
```

**Q: 令牌過期**
```
A: 系統會自動刷新令牌
  如果需要重新授權，刪除 google-token.json 後重複上述步驟
```

## ✨ 完成後

準備好了嗎？告訴我授權是否成功！
