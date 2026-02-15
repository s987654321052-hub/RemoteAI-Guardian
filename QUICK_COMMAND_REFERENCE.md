# 🚀 RemoteAI Guardian - 快速參考卡

## ⚡ 30 秒快速開始

```powershell
cd C:\RemoteAI-Guardian
.\start-all-local.bat
```

✅ 會自動打開 3 個終端，啟動所有服務

---

## 📱 常用命令

### 基礎命令
```
ping              連接測試
help              查看幫助
status            系統狀態
time              當前時間
```

### 執行命令
```
run dir                   列出文件
run tasklist             進程列表
run ipconfig             網絡配置
run systeminfo           系統信息
```

### Docker 命令
```
run docker ps            運行中的容器
run docker ps -a         所有容器
run docker images        鏡像列表
```

### 測試
```
node test-webhook-local.js ping
node test-webhook-local.js "run dir"
node test-webhook-local.js            完整測試
```

---

## 🌐 服務地址

| 服務 | 地址 | 用途 |
|------|------|------|
| 認證 | http://localhost:8888 | 設備配對、令牌 |
| Webhook | http://localhost:3001 | 命令接收 |
| 測試 | test-webhook-local.js | 本地測試 |

---

## 📊 檢查狀態

```powershell
# 查看運行中的服務
netstat -ano | findstr ":8888 :3001"

# 查看認證系統
curl http://localhost:8888/api/status

# 查看 Webhook 健康
curl http://localhost:3001/health

# 查看已配對設備
curl http://localhost:8888/api/devices
```

---

## 🛑 停止服務

```powershell
# 停止所有 Node 進程
taskkill /F /IM node.exe

# 或在各終端按 Ctrl+C
```

---

## 💾 重要文件位置

```
C:\RemoteAI-Guardian\
├── auth-system\
│   ├── auth-system.js              認證系統
│   ├── line-webhook-simple.js      Webhook
│   ├── test-webhook-local.js       測試工具
│   └── package.json                依賴列表
├── start-all-local.bat             一鍵啟動
├── DEPLOYMENT_OPTIONS.md           部署方案
├── DEPLOYMENT.md                   詳細指南
└── .env                            配置文件
```

---

## 🔧 常見問題

### 為什麼 Line 無法回應？
LINE API 網絡問題（正常）。本地測試完全正常。

### 如何自定義命令？
編輯 `line-webhook-simple.js` 中的 `handleCommand()` 函數

### 如何添加新命令？
```javascript
case 'mycommand':
  response = 'My response';
  break;
```

### 如何部署到公網？
見 `DEPLOYMENT_OPTIONS.md` 方案 2 或 3

---

## ✨ 功能清單

✅ 本地命令執行
✅ Webhook 接收
✅ 命令解析
✅ 結果回報
✅ 錯誤處理
✅ 用戶驗證

---

## 🎯 下一步

### 現在
- [ ] 運行 `start-all-local.bat`
- [ ] 測試各個命令
- [ ] 確認所有功能正常

### 後期
- [ ] 部署到 Heroku（免費）
- [ ] 購買 VPS（$5/月）
- [ ] 設置真實 LINE 訊息
- [ ] 添加自定義命令

---

## 📞 支持

遇到問題？
1. 查看 `DEPLOYMENT_OPTIONS.md`
2. 查看 `DEPLOYMENT.md`
3. 檢查終端日誌

---

**享受遠程控制！** 🚀
