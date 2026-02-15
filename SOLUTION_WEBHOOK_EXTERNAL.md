# 🎯 LINE Webhook 最終解決方案

## 🔴 根本問題

**Tailscale IP (100.127.44.67) 無法被 LINE 伺服器從外網訪問**

Tailscale 是 VPN，設計上只允許 Tailscale 網絡內的設備相互訪問，不支持外網訪問。

---

## ✅ 解決方案

### 方案 1️⃣：使用 Webhook.site 驗證（推薦 - 立即試）

#### 步驟 A：生成臨時 Webhook URL

1. 打開 https://webhook.site
2. 會自動生成一個 HTTPS URL，類似：
   ```
   https://webhook.site/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```
3. **複製這個 URL**

#### 步驟 B：在 LINE Developers Console 測試

1. 進入 LINE Developers Console
2. **Messaging API** → **Webhook settings**
3. **Webhook URL** 改為你的 webhook.site URL
4. 點擊 **Save**
5. 點擊 **Verify**

#### 步驟 C：檢查結果

- ✅ **如果 webhook.site 收到請求** → LINE 正常工作，問題是 Tailscale IP 無法被外網訪問
- ❌ **如果沒收到** → LINE 帳號或 Channel 配置問題

---

### 方案 2️⃣：本地測試模式（開發用）

如果你只想在本地測試功能，不需要 LINE 真實訊息，可以用本地模式。

#### 測試本地 Webhook

```powershell
# 模擬 LINE 發送的訊息
$body = @{
  events = @(
    @{
      type = "message"
      source = @{ userId = "Uee2657aac9ffdc9d6d63f7e5097c0bbc" }
      message = @{ type = "text"; text = "status" }
      replyToken = "test"
    }
  )
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/webhook/line" `
  -Method Post -Body $body -ContentType "application/json"
```

應該返回 `200 OK`。

---

### 方案 3️⃣：使用 Tailscale Funnel（企業方案）

Tailscale 支持 Funnel 功能讓外網訪問 Tailscale IP，但需要：
- 付費 Tailscale 帳號
- 特殊配置

---

### 方案 4️⃣：使用公網 VPS（推薦生產環境）

購買便宜的 VPS（如 Linode, DigitalOcean），在上面部署 webhook 轉發：

```
LINE Webhook 事件
  ↓
外網 VPS (HTTPS, 公網 IP)
  ↓
Tailscale 隧道
  ↓
你的本地 RemoteAI Guardian
```

成本：約 $5/月

---

## 🚀 現在就試試

### 立即行動

1. **打開 https://webhook.site**
2. **複製生成的 URL**
3. **進入 LINE Developers Console**
4. **貼入 Webhook URL**
5. **點擊 Save 和 Verify**
6. **回到 webhook.site，檢查是否收到訊息**

這樣可以確認：
- ✅ LINE 帳號是否正常
- ✅ LINE 是否能發送 webhook
- ✅ 問題是否只是 Tailscale IP 無法被外網訪問

---

## 📊 診斷結果判斷

### 如果 webhook.site 收到訊息 ✅

這說明：
- ✅ LINE 帳號完全正常
- ✅ Webhook 功能可用
- ✅ 只是 Tailscale IP 無法從外網訪問

**解決方法：**
- 使用方案 3 或 4（Tailscale Funnel 或公網 VPS）
- 或只在本地測試

### 如果 webhook.site 沒收到訊息 ❌

這說明：
- ❌ LINE Channel 配置有問題
- ❌ Channel Secret 不匹配
- ❌ 帳號權限問題

**檢查項目：**
- LINE Channel ID 是否正確
- Channel Secret 是否正確
- Official Account 是否已上線
- Message API 是否已啟用

---

## 🎯 下一步

**現在就用 Webhook.site 測試！**

告訴我結果：
1. Webhook.site 是否收到訊息？
2. 收到什麼內容？

根據結果，我會幫你部署正確的解決方案。

---

## 💡 技術提示

如果你想要**完整的 LINE 集成**（在本地，不需要外網訪問），可以：

1. 使用 **本地測試模式**（我已經提供了測試代碼）
2. 模擬 LINE 訊息進行測試
3. 驗證命令執行功能
4. 等後續需要真實 LINE 訊息時，再部署到公網

---

**立即試試 Webhook.site 吧！** 🚀

這是診斷問題的最快方法。
