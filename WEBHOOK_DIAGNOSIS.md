# 🔧 LINE Webhook 診斷和修復指南

## ❌ 問題

在 LINE Developers Console 點擊 Verify 時出現：
```
發送 webhook 事件物件時發生錯誤。
```

## 🔍 原因分析

可能的原因：
1. **Tailscale IP 無法從外網訪問** - LINE 伺服器無法連接到 `100.127.44.67:3001`
2. **防火牆阻擋** - 3001 端口被防火牆攔截
3. **HTTPS 證書問題** - 自簽證書驗證失敗
4. **路由問題** - Tailscale 無法正確轉發流量

---

## ✅ 解決方案

### 方案 A：使用 Webhook 測試服務（最快）

用 **Webhook.site** 或 **RequestBin** 快速測試 LINE 是否能發送 webhook。

#### 步驟 1：進入 https://webhook.site

1. 打開 https://webhook.site
2. 會自動生成一個 URL，類似：
   ```
   https://webhook.site/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

#### 步驟 2：複製 URL 到 LINE Developers Console

1. 進入 LINE Developers Console
2. **Messaging API** → **Webhook settings**
3. **Webhook URL** 改為 webhook.site 的 URL
4. 點擊 **Save** → **Verify**

#### 步驟 3：檢查結果

- ✅ 如果 webhook.site 收到請求 → LINE 伺服器正常工作
- ❌ 如果沒收到 → LINE Channel 配置有問題

---

### 方案 B：使用本地 HTTP（開發模式）

改為 HTTP（非 HTTPS），用於本地測試。

#### 優點
- 不需要 SSL 證書
- 更快速
- 更容易調試

#### 步驟

1. **改用 HTTP 版本的 webhook**

   停止現有 webhook：
   ```powershell
   taskkill /PID $(netstat -ano | findstr :3001 | awk '{print $5}') /F
   ```

   啟動 HTTP 版本：
   ```powershell
   cd C:\RemoteAI-Guardian\auth-system
   node line-webhook-simple.js
   ```

2. **在 LINE Developers Console 中**

   Webhook URL 改為：
   ```
   http://100.127.44.67:3001/webhook/line
   ```

   ⚠️ LINE 會顯示警告（HTTP 不安全），但可以點擊 "I understand and want to use HTTP"

3. 點擊 **Save** → **Verify**

---

### 方案 C：使用公網服務（推薦生產環境）

如果 Tailscale IP 無法被外網訪問，使用以下選項：

#### 選項 1：使用 Heroku（免費 HTTPS）

#### 選項 2：使用 AWS/GCP/Azure（付費但專業）

#### 選項 3：使用 Replit（免費 HTTPS）

---

## 🧪 快速診斷

運行這個測試確認 webhook 是否在監聽：

```powershell
# 測試本地 HTTP
$body = @{ events = @() } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3001/webhook/line" `
  -Method Post -Body $body -ContentType "application/json"

# 應該返回 200 OK
```

---

## 🎯 建議順序

1. **先試 Webhook.site**（最快確認 LINE 是否正常）
2. **再試 HTTP 本地版本**（如果 Webhook.site 工作）
3. **最後用 HTTPS Tailscale**（如果前兩個都成功）

---

## 📞 立即開始

### 最快方案（5 分鐘）

1. 打開 https://webhook.site
2. 複製生成的 URL
3. 貼入 LINE Developers Console
4. 點擊 Verify
5. 檢查 webhook.site 是否收到請求

如果收到，說明 LINE 正常工作，問題在於 Tailscale IP 無法被外網訪問。

---

## 💡 技術細節

### 為什麼 Tailscale IP 可能無法被外網訪問

Tailscale 是 VPN，設計上：
- ✅ 你的設備可以訪問 Tailscale IP
- ✅ Tailscale 內的其他設備可以訪問
- ❌ **外網（包括 LINE 伺服器）可能無法訪問 Tailscale IP**

### 解決方案

要讓 LINE 訪問 Tailscale IP，需要：
1. Tailscale Funnel（需付費或特殊配置）
2. 或使用公網服務作為中轉

---

## 🚀 下一步

**立即試試 Webhook.site 方案！** 這樣可以快速確認問題在哪裡。

告訴我結果，我根據結果進一步幫你。
