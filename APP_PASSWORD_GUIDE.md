# 🔓 Google 應用密碼設置指南

## 情況說明

你的 Gmail 帳號 (`s987654321052@gmail.com`) 有企業政策限制，無法使用 OAuth。

**解決方案：** 使用「Google 應用密碼」代替 OAuth

---

## 📋 步驟

### 步驟 1: 打開 Google 帳號安全性設定

在瀏覽器中打開：
```
https://myaccount.google.com/security
```

用你的 Gmail 登入

### 步驟 2: 找到「應用密碼」

1. 在左側菜單找到「應用密碼」(App passwords)
2. 如果沒看到，可能是因為：
   - 你沒有啟用 2 步驟驗證
   - 先啟用 2 步驟驗證: https://myaccount.google.com/security

### 步驟 3: 生成應用密碼

1. 點擊「應用密碼」
2. 選擇：
   - 應用：Mail
   - 設備：Windows 電腦
3. 點擊「Generate」
4. Google 會顯示一個 **16 位密碼**（例如：`abcd efgh ijkl mnop`）

### 步驟 4: 複製密碼

1. 複製那個 16 位密碼
2. **移除所有空格**
3. 你會得到像這樣的密碼：`abcdefghijklmnop`

### 步驟 5: 在我們的系統中設置

停止正在運行的程序，然後執行：

```bash
cd C:\RemoteAI-Guardian\auth-system
npm run setup-app-password
```

程序會要求你輸入：
1. Gmail 帳號：`s987654321052@gmail.com`
2. 應用密碼：`(貼上 16 位密碼，不含空格)`

然後按 Enter。

### 步驟 6: 完成

應用密碼已保存到：
```
C:\RemoteAI-Guardian\credentials\google-app-password.json
```

---

## ✅ 下一步

完成上述步驟後，重啟認證系統：

```bash
npm start
```

系統將使用應用密碼連接到 Google Sheets、Gmail 等服務。

---

## 🔒 安全說明

- 應用密碼只能用於非 Google 應用
- 比完整密碼更安全（萬一洩漏，只影響該應用）
- 隨時可以在 Google 帳號設定中撤銷

---

## 📞 需要幫助？

運行：
```bash
npm run setup-app-password
```

有任何問題告訴我！
