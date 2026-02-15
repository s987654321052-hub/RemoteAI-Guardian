# 🚀 RemoteAI Guardian - 第一階段快速開始

## 檔案清單

已為你準備的文件：

```
C:\RemoteAI-Guardian\
├── setup-guide.md                    ← 完整設置指南
├── auth-system\
│   ├── auth-system.js                ← 核心認證系統
│   ├── line-notifier.js              ← LINE 通知模組
│   ├── dashboard-updater.js          ← 儀表板更新工具
│   ├── package.json                  ← NPM 依賴
│   ├── .env.example                  ← 環境變數模板
│   ├── test-dashboard-update.js      ← 測試腳本
│   └── .env                          ← 真實配置（你需要建立）
├── credentials\
│   ├── google-key.json               ← Google Service Account 金鑰
│   ├── server.crt                    ← TLS 證書（自動生成）
│   └── server.key                    ← TLS 私鑰（自動生成）
└── logs\
    └── （自動建立）
```

---

## ⚡ 5 分鐘快速開始

### 1️⃣ 複製 .env 文件

```bash
cd C:\RemoteAI-Guardian\auth-system
copy .env.example .env
```

### 2️⃣ 安裝依賴

```bash
npm install
```

### 3️⃣ 啟動認證系統

```bash
npm start
```

你應該看到：
```
🚀 認證系統已啟動
📱 蘋果配對端點: http://localhost:8888/api/pair/request
🔐 認證驗證端點: http://localhost:8888/api/auth/verify
```

### 4️⃣ 測試儀表板更新

**新開一個命令行視窗：**

```bash
cd C:\RemoteAI-Guardian\auth-system
npm run update-dashboard
```

你應該看到：
```
✅ 已更新任務: task-auth-1 - COMPLETED (100%)
```

並且在瀏覽器 http://127.0.0.1:9999 看到進度更新！

---

## 📋 完整安裝步驟

詳見 `setup-guide.md`：

1. **環境準備** - Python 3.12.9、Node.js
2. **Google Service Account** - 建立並下載金鑰
3. **Tailscale 配置** - Windows + iPhone 連接
4. **認證系統安裝** - 啟動蘋果認證
5. **LINE 通知設置** - 測試通知發送
6. **測試與驗收** - 確認所有功能

---

## 🔍 故障排除

**Q: npm install 失敗**
```
A: 確保你在 C:\RemoteAI-Guardian\auth-system 目錄
  然後運行: npm cache clean --force
  再試一次: npm install
```

**Q: 認證系統無法啟動**
```
A: 檢查 .env 文件是否存在
  確保 PORT 8888 沒被其他程式佔用
  運行: netstat -ano | findstr ":8888"
```

**Q: 儀表板更新失敗**
```
A: 確保儀表板正在運行 (http://127.0.0.1:9999)
  檢查防火牆設置
  試試: curl http://127.0.0.1:9999/api/project
```

---

## 📞 需要幫助？

遇到問題時：
1. 查看完整指南: `setup-guide.md`
2. 檢查日誌: `logs/` 目錄
3. 告訴我錯誤訊息和你執行到哪一步

---

## ✅ 完成標記

完成每個步驟時更新此清單：

- [ ] Python 3.12.9 已安裝
- [ ] 認證系統文件已就位
- [ ] npm install 成功
- [ ] 認證系統已啟動
- [ ] 儀表板更新測試成功
- [ ] Google Service Account 已建立
- [ ] Tailscale 已配置
- [ ] LINE 通知已測試

---

## 🎯 下一步

完成上述所有步驟後：
1. 按照 `setup-guide.md` 完成 Google、Tailscale、LINE 的配置
2. 告訴我完成進度
3. 準備第二階段（手機應用開發）

祝你順利！ 🚀
