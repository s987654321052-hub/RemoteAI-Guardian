# RemoteAI Guardian 第四階段：AI 指令執行系統

## 📋 目標

構建一個完整的 iOS App，用戶可以用自然語言給 AI 下指令，AI 解析後在 Windows 電腦上執行任務。

## 🏗️ 系統架構

```
┌─────────────┐
│  iPhone     │
│  (SwiftUI)  │
└──────┬──────┘
       │ "打開 VS Code 並創建一個 HTML 文件"
       ↓ (HTTPS/TLS)
┌──────────────────┐
│  Tailscale       │
│  (公開傳輸)       │
└──────┬───────────┘
       │
       ↓
┌──────────────────────────┐
│  API 網關 (9999)          │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  AI 指令解析器            │
│  (NLP + 命令提取)        │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  任務執行引擎            │
│  (Windows 自動化)       │
├──────────────────────────┤
│  • 打開應用程序          │
│  • 創建文件/文件夾       │
│  • 編輯代碼              │
│  • 執行命令              │
│  • 運行腳本              │
└──────┬───────────────────┘
       │
       ↓
┌──────────────────────────┐
│  結果反饋                 │
│  (截圖 + 文字 + 進度)    │
└──────────────────────────┘
       │ (回傳給 iPhone)
       ↓
┌─────────────┐
│  用戶看到   │
│  完成結果    │
└─────────────┘
```

## 📱 iOS App 功能

### 1. 首屏 - 主界面
```swift
- 命令輸入框
- 語音識別按鈕
- 最近命令歷史
- 執行按鈕
- 實時狀態指示器
```

### 2. 命令輸入
```
示例命令:
- "打開 VS Code"
- "在桌面創建一個名為 test.txt 的文件"
- "進入 C:\Projects 目錄"
- "運行 npm start"
- "打開 Chrome 並訪問 google.com"
- "創建一個 Python 文件並寫入 Hello World"
```

### 3. 實時反饋
```
- 命令發送狀態
- 執行進度條
- 實時日誌
- 截圖預覽
- 完成時間
```

## 🤖 AI 指令解析系統

### 指令類型

1. **應用控制** — 打開/關閉應用
2. **文件操作** — 創建/編輯/刪除文件
3. **目錄操作** — 創建/刪除/瀏覽文件夾
4. **命令執行** — 運行系統命令
5. **代碼操作** — 編寫和執行代碼
6. **多步驟任務** — 組合多個操作

### 解析流程

```
用戶輸入
   ↓
分詞和識別
   ↓
提取命令類型
   ↓
提取參數
   ↓
驗證和標準化
   ↓
轉換為系統命令
   ↓
執行
```

## 💻 Windows 執行引擎

### 支持的操作

```
1. 應用啟動
   • powershell: start "C:\Program Files\Visual Studio Code\Code.exe"
   • powershell: explorer C:\Users\user\Desktop

2. 文件操作
   • New-Item -Path "C:\test.txt" -ItemType File
   • Get-Content C:\test.txt
   • Set-Content -Path "C:\test.txt" -Value "Hello"

3. 目錄操作
   • New-Item -Path "C:\NewFolder" -ItemType Directory
   • Get-ChildItem C:\Users\user\Documents

4. 命令執行
   • cmd /c "ipconfig"
   • npm start
   • python script.py

5. 腳本執行
   • powershell -ExecutionPolicy Bypass -File script.ps1
   • python -c "print('Hello')"
```

## 📊 API 設計

### 新增端點

```
POST /api/ai/command
Body: {
  "command": "打開 VS Code",
  "deviceId": "iphone-123",
  "timestamp": "2026-02-15T07:30:00Z"
}

Response: {
  "success": true,
  "taskId": "task-uuid-123",
  "message": "任務已接收",
  "estimatedTime": 5
}

GET /api/ai/task/:taskId
Response: {
  "status": "executing",
  "progress": 45,
  "log": ["打開 VS Code...", "進程啟動中..."],
  "screenshot": "base64_encoded_image"
}

GET /api/ai/task/:taskId/result
Response: {
  "status": "completed",
  "result": {
    "success": true,
    "message": "VS Code 已打開",
    "output": "Process started with PID 1234",
    "screenshot": "base64_image"
  }
}
```

## 🔄 實現步驟

### 步驟 1: AI 指令解析器
```
文件: ai-command-parser.js
功能:
- 解析自然語言
- 提取操作類型
- 提取參數
- 生成執行命令
```

### 步驟 2: Windows 執行引擎
```
文件: windows-executor.js
功能:
- 執行 PowerShell 命令
- 捕獲輸出
- 獲取屏幕截圖
- 監控進程狀態
```

### 步驟 3: 任務隊列和管理
```
文件: task-queue.js
功能:
- 任務隊列管理
- 任務調度
- 進度跟蹤
- 結果存儲
```

### 步驟 4: iOS App
```
文件: RemoteAIGuardianApp.swift
功能:
- 命令輸入
- 語音識別
- 實時進度
- 結果顯示
```

### 步驟 5: API 集成
```
文件: ai-routes.js
功能:
- 接收命令
- 隊列管理
- 進度查詢
- 結果返回
```

## 🎯 使用流程示例

### 示例 1: 打開應用

```
用戶說: "打開 VS Code"
   ↓
App 發送: {"command": "打開 VS Code"}
   ↓
AI 解析: {type: "app", app: "vscode"}
   ↓
執行引擎: start "C:\Program Files\Visual Studio Code\Code.exe"
   ↓
結果返回: {status: "success", message: "VS Code 已打開"}
   ↓
用戶看到: ✅ VS Code 已打開 (含截圖)
```

### 示例 2: 創建文件

```
用戶說: "在桌面創建一個名為 test.html 的文件，內容是 Hello World"
   ↓
App 發送: {"command": "在桌面創建一個名為 test.html 的文件，內容是 Hello World"}
   ↓
AI 解析: {
  type: "file_create",
  path: "C:\Users\user\Desktop\test.html",
  content: "Hello World"
}
   ↓
執行引擎: 
  New-Item -Path "C:\Users\user\Desktop\test.html" -ItemType File
  Set-Content -Path "..." -Value "Hello World"
   ↓
結果返回: {status: "success", filePath: "C:\Users\user\Desktop\test.html"}
   ↓
用戶看到: ✅ 文件已創建 (含文件預覽)
```

### 示例 3: 運行代碼

```
用戶說: "寫一個 Python 腳本打印 1 到 10 的數字"
   ↓
App 發送: {"command": "寫一個 Python 腳本打印 1 到 10 的數字"}
   ↓
AI 解析和生成代碼:
  script_path = "C:\temp\script.py"
  code = "for i in range(1, 11):\n    print(i)"
   ↓
執行引擎:
  創建文件
  執行: python C:\temp\script.py
   ↓
結果返回: {
  status: "success",
  output: "1\n2\n3\n...\n10",
  scriptPath: "C:\temp\script.py"
}
   ↓
用戶看到: ✅ 腳本已執行，輸出結果
```

## 🔐 安全考慮

1. **命令白名單** — 只允許特定的應用和命令
2. **沙箱執行** — 限制文件訪問權限
3. **日誌記錄** — 所有命令都要記錄
4. **用戶確認** — 高風險操作需要確認
5. **令牌驗證** — 每個命令都需要驗證身份

## 📅 開發時間表

- **第 1 天**: AI 指令解析器 (4 小時)
- **第 2 天**: Windows 執行引擎 (6 小時)
- **第 3 天**: 任務隊列和 API (4 小時)
- **第 4 天**: iOS App 開發 (8 小時)
- **第 5 天**: 集成測試和優化 (4 小時)

**總計**: 26 小時

## 💾 需要的新文件

```
auth-system/
├── ai/
│   ├── command-parser.js      # AI 指令解析
│   ├── windows-executor.js    # Windows 執行引擎
│   ├── screenshot-taker.js    # 截圖工具
│   └── command-templates.js   # 命令模板
├── task/
│   ├── task-queue.js          # 任務隊列
│   ├── task-manager.js        # 任務管理器
│   └── task-storage.js        # 任務存儲
├── routes/
│   └── ai-routes.js           # AI API 路由
└── utils/
    ├── shell-executor.js      # Shell 執行器
    └── process-monitor.js     # 進程監控
```

## ✅ 成功標準

- [ ] 能識別基本命令 (打開應用、創建文件等)
- [ ] 能正確執行 Windows 命令
- [ ] 能捕獲執行結果和屏幕截圖
- [ ] iOS App 能發送和接收命令
- [ ] 實時進度和結果反饋正常
- [ ] 安全措施到位
- [ ] 性能滿足要求 (< 5 秒響應時間)

---

**準備好開始第四階段了嗎？** 🚀
