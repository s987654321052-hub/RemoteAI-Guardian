# 🔧 LINE Webhook 驗證修復指南

## ❌ 問題

在 LINE Developers Console 中點擊「Verify」時出現：
```
An error occurred when sending the webhook event object. 
For more information, see Investigate the cause of webhook reception failure.
```

## ✅ 解決方案

### 原因
1. **Raw Body 處理** - Webhook 簽名驗證需要原始 body，不能是 JSON 物件
2. **API Endpoint 兼容性** - LINE API 端點可能需要調整
3. **開發模式支持** - 添加開發模式，允許無簽名請求用於測試

### 已修復的問題
- ✅ 正確處理 raw body 用於簽名驗證
- ✅ 改進錯誤處理和日誌
- ✅ 添加開發模式支持
- ✅ 超時設定

---

## 🚀 現在重試

### 步驟 1：在 LINE Developers Console 驗證

1. 進入 [LINE Developers Console](https://developers.line.biz/console/)
2. 選擇你的 Channel
3. 進入 **Messaging API** → **Webhook settings**
4. 確保 **Webhook URL** 是：
   ```
   http://100.127.44.67:3001/webhook/line
   ```
5. 點擊 **Verify** 按鈕

### 預期結果
你應該看到：
```
✅ Webhook URL 已驗證
```

---

## 🧪 如果還是失敗

### 調試步驟

#### 1. 檢查服務是否運行
```powershell
netstat -ano | findstr :3001
# 應該看到 LISTENING
```

#### 2. 測試 Webhook 連接

```powershell
# 測試不帶簽名的連接（開發模式）
$body = '{"events":[]}'
$response = Invoke-WebRequest -Uri "http://localhost:3001/webhook/line" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" `
  -ErrorAction Continue

Write-Host "狀態碼: $($response.StatusCode)"
```

應該返回 `200` 或 `403`（取決於簽名）

#### 3. 查看終端日誌

在 LINE 命令處理器終端中，應該看到：
```
🚀 LINE 命令處理器已啟動
📍 Webhook URL: http://localhost:3001/webhook/line
✅ 已初始化 LINE 命令處理器
```

---

## 📋 常見問題排查

### Q: 仍然看到 "An error occurred" 錯誤

**A: 檢查以下項目：**

1. **Webhook URL 格式**
   ```
   ❌ 錯誤: http://localhost:3001/webhook/line
   ✅ 正確: http://100.127.44.67:3001/webhook/line
   ```
   必須使用 Tailscale 公網 IP，不能用 localhost

2. **防火牆設置**
   ```powershell
   # 允許 3001 端口
   netsh advfirewall firewall add rule name="RemoteAI LINE" `
     dir=in action=allow protocol=tcp localport=3001
   ```

3. **Channel Secret 是否正確**
   在 `.env` 文件中檢查：
   ```
   LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c
   ```

### Q: Webhook 驗證成功了，但 LINE 上沒有回應

**A: 這是正常的，因為：**
- LINE 先進行 Webhook 驗證（infrastructure test）
- 之後用戶才能發送真實消息
- 發送消息時，Webhook 會接收事件並處理

**試試看：**
在你的 LINE 個人帳號發送：
```
help
```

---

## ✨ Webhook 工作流程

```
┌─────────────────────────┐
│   LINE 官方帳號         │
└────────────┬────────────┘
             │
             │ 1. 驗證 Webhook URL
             ▼
┌─────────────────────────┐
│  你的 RemoteAI 系統     │
│  (3001 端口)            │
└────────────┬────────────┘
             │
             │ 2. 返回 200 OK
             ▼
┌─────────────────────────┐
│   LINE 驗證成功         │
└────────────┬────────────┘
             │
             │ 3. 用戶發送消息
             ▼
┌─────────────────────────┐
│  Webhook 接收消息       │
│  執行命令               │
│  發送回應               │
└─────────────────────────┘
```

---

## 🎯 驗證成功的標誌

當 LINE Developers Console 顯示：

```
✅ Connection successful
   Webhook URL has been verified
```

你就可以開始在 LINE 上測試命令了！

---

## 🧪 驗證後立即測試

Webhook 驗證成功後，立即在 LINE 上發送：

```
status
```

你應該看到：
```
✅ 系統狀態

狀態: ✅ 運行中
已配對設備: 0
活躍令牌: 0
啟動時間: ...
```

---

## 📞 最後檢查清單

- [ ] Webhook URL 已更新為 `http://100.127.44.67:3001/webhook/line`
- [ ] LINE 命令處理器正在運行（端口 3001）
- [ ] 在 LINE Developers Console 點擊「Verify」
- [ ] 看到 ✅ "Connection successful"
- [ ] 在 LINE 上發送 `status` 測試
- [ ] 收到系統狀態回應

完成所有檢查後，系統就完全就緒了！🎉

---

**現在重試驗證吧！** ✅
