╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║           🚀 Windows 安裝 macOS 虛擬機與打包流程 - 完整指南                 ║
║                                                                            ║
║              RemoteAI Guardian - 多平台構建和發佈系統                      ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝


📋 目錄
════════════════════════════════════════════════════════════════════════════

1. 在 Windows 上運行 macOS 的方法
2. GitHub Actions 自動化構建 (推薦)
3. 本地多平台構建
4. 完整打包和發佈流程
5. 簽名和公證
6. 快速開始指南


═══════════════════════════════════════════════════════════════════════════════

🔴 第 1 部分：在 Windows 上運行 macOS 虛擬機
═══════════════════════════════════════════════════════════════════════════════

⚠️ 重要法律聲明
────────────────────────────────────────────────────────────────────────────

在 Windows 上運行 macOS 存在法律限制：

❌ 不支援
  • Apple 官方不支援在 Windows PC 上運行 macOS
  • 可能違反 Apple 軟體許可協議 (EULA)
  • 使用 KVM、QEMU 或虛擬化軟體均不合法

✅ 合法替代方案 (推薦)
  • GitHub Actions - 完全免費的自動化構建 (3000分鐘/月)
  • MacStadium - 雲端 Mac 服務 (~$1/小時)
  • Mac mini/Mac Studio - 購買實體 Mac (~$600+)
  • Mac in the Cloud - 按需租賃 macOS 環境


─────────────────────────────────────────────────────────────────────────────

方法對比
────────────────────────────────────────────────────────────────────────────

┌──────────────────┬──────────┬─────────┬──────────┬────────────┐
│ 方案             │ 成本     │ 難度    │ 合法性   │ 推薦度     │
├──────────────────┼──────────┼─────────┼──────────┼────────────┤
│ GitHub Actions   │ 免費     │ ⭐     │ ✅ 合法  │ ⭐⭐⭐⭐⭐ │
│ MacStadium       │ ~$1/小時 │ ⭐⭐   │ ✅ 合法  │ ⭐⭐⭐⭐  │
│ Mac mini         │ $600+    │ ⭐⭐⭐ │ ✅ 合法  │ ⭐⭐⭐   │
│ KVM/QEMU         │ 免費     │ ⭐⭐⭐⭐│ ⚠️ 灰色  │ ⭐⭐     │
│ Parallels/VMware │ $80+     │ ⭐⭐   │ ⚠️ 灰色  │ ⭐       │
└──────────────────┴──────────┴─────────┴──────────┴────────────┘

💡 最佳實踐：使用 GitHub Actions (完全合法、自動化、免費)


═══════════════════════════════════════════════════════════════════════════════

✅ 第 2 部分：GitHub Actions 自動化構建 (推薦方案)
═══════════════════════════════════════════════════════════════════════════════

為什麼選擇 GitHub Actions？
────────────────────────────────────────────────────────────────────────────

✅ 完全合法
  • Apple 官方支援
  • 符合所有許可協議

✅ 完全免費
  • 開源項目: 無限制
  • 公開倉庫: 3000 分鐘/月免費

✅ 自動化
  • 推送代碼自動構建
  • 創建標籤自動發佈
  • 無需本地構建環境

✅ 多平台支援
  • macOS: latest, 12, 11
  • Windows: latest, 2022, 2019
  • Linux: ubuntu-latest, ubuntu-22.04, ubuntu-20.04

✅ 內置構件存儲
  • 自動保存構件
  • 30 天保留期
  • 下載後永久保存


快速開始 (5 分鐘)
────────────────────────────────────────────────────────────────────────────

第 1 步：建立 GitHub 倉庫
  1. 前往 github.com
  2. 新建倉庫
  3. 推送你的 RemoteAI Guardian 代碼

第 2 步：設置 GitHub Actions
  1. 進入「Actions」標籤
  2. 已經為你生成了 3 個工作流:
     • build-ios-app.yml    - iOS 構建
     • build-macos-app.yml  - macOS 構建
     • release.yml          - 完整發佈

第 3 步：觸發構建
  方式 1 - 推送代碼自動構建:
  $ git push origin main

  方式 2 - 創建發佈標籤:
  $ git tag v1.1.0
  $ git push origin v1.1.0

第 4 步：查看結果
  • 訪問 GitHub Actions 儀表板
  • 下載構件
  • 查看發佈版本


工作流文件位置
────────────────────────────────────────────────────────────────────────────

C:\RemoteAI-Guardian\
├── .github\
│   └── workflows\
│       ├── build-ios-app.yml      ← iOS 應用自動構建
│       ├── build-macos-app.yml    ← macOS 應用自動構建
│       └── release.yml             ← 完整發佈流程


工作流特性
────────────────────────────────────────────────────────────────────────────

build-ios-app.yml
  ✓ 支援多個構建類型 (development, staging, production)
  ✓ 自動簽名和代碼簽名
  ✓ 導出 IPA 用於 TestFlight 或 App Store
  ✓ 上傳到 GitHub Releases
  ✓ 觸發條件: iOS 目錄變更

build-macos-app.yml
  ✓ 支援多個構建類型
  ✓ 自動生成 DMG 和 ZIP
  ✓ 代碼簽名和公證 (可選)
  ✓ 上傳到 GitHub Releases
  ✓ Slack 通知 (可選)
  ✓ 觸發條件: auth-system 目錄變更

release.yml
  ✓ 支援 iOS、macOS、Windows、Linux 多平台
  ✓ 平行構建所有平台
  ✓ 自動生成校驗和
  ✓ 自動生成變更日誌
  ✓ 創建 GitHub Release
  ✓ 上傳所有構件
  ✓ 觸發條件: 創建版本標籤 (v*.*.*)


═══════════════════════════════════════════════════════════════════════════════

🔨 第 3 部分：本地多平台構建
═══════════════════════════════════════════════════════════════════════════════

環境準備
────────────────────────────────────────────────────────────────────────────

Windows
  1. 安裝 Node.js 20+
     https://nodejs.org/
  
  2. 安裝 npm 依賴
     npm install -g electron-builder

macOS
  1. 安裝 Xcode
     xcode-select --install
  
  2. 安裝 Node.js 20+
     brew install node@20

Linux (Ubuntu)
  1. 安裝構建工具
     sudo apt-get install build-essential python3
  
  2. 安裝 Node.js 20+
     sudo apt-get install nodejs npm


本地構建步驟
────────────────────────────────────────────────────────────────────────────

方式 1：使用構建腳本 (推薦)

  # macOS/Linux
  bash scripts/build.sh 1.1.0
  
  # 按提示選擇:
  # 1. 清理舊構建
  # 2. 安裝依賴
  # 3. 運行測試
  # 4. 選擇平台 (iOS, macOS, Windows, Linux 或全部)

方式 2：手動構建

  iOS (需要 macOS):
  $ cd iOS
  $ xcodebuild -scheme RemoteAIGuardian -configuration Release -sdk iphoneos archive
  $ xcodebuild -exportArchive -archivePath ... -exportPath build/ipa

  macOS:
  $ cd auth-system
  $ npm install --save-dev electron electron-builder
  $ npx electron-builder --mac dmg

  Windows:
  $ cd auth-system
  $ npm install --save-dev electron electron-builder
  $ npx electron-builder --win

  Linux:
  $ cd auth-system
  $ npm install --save-dev electron electron-builder
  $ npx electron-builder --linux AppImage deb


構建輸出位置
────────────────────────────────────────────────────────────────────────────

dist/
├── RemoteAIGuardian-1.1.0.ipa           (iOS)
├── RemoteAIGuardian-1.1.0.dmg           (macOS)
├── RemoteAIGuardian-1.1.0.exe           (Windows)
├── RemoteAIGuardian-1.1.0.AppImage      (Linux)
├── RemoteAIGuardian-1.1.0.deb           (Linux)
├── SHA256SUMS.txt                       (校驗和)
└── RELEASE_NOTES.md                     (發佈說明)


═══════════════════════════════════════════════════════════════════════════════

📦 第 4 部分：完整打包和發佈流程
═══════════════════════════════════════════════════════════════════════════════

發佈流程圖
────────────────────────────────────────────────────────────────────────────

1. 更新版本號
   ↓
2. 本地測試構建
   ↓
3. 提交到 Git
   ↓
4. 創建版本標籤 (git tag v1.1.0)
   ↓
5. 推送到 GitHub
   ↓
6. GitHub Actions 自動構建
   ├─ iOS (macOS runner)
   ├─ macOS (macOS runner)
   ├─ Windows (windows runner)
   └─ Linux (ubuntu runner)
   ↓
7. 自動生成發佈頁面
   ├─ 上傳所有構件
   ├─ 生成校驗和
   ├─ 生成變更日誌
   └─ 發佈到 GitHub Releases
   ↓
8. 手動發佈到各平台
   ├─ iOS → TestFlight/App Store
   ├─ macOS → 官網或 App Store
   ├─ Windows → 官網或 Microsoft Store
   └─ Linux → GitHub Releases


快速發佈 (一鍵操作)
────────────────────────────────────────────────────────────────────────────

第 1 步：更新版本
  $ npm version minor  # 1.0.0 → 1.1.0

第 2 步：本地測試
  $ bash scripts/build.sh 1.1.0

第 3 步：推送到 GitHub
  $ git push origin main
  $ git tag v1.1.0
  $ git push origin v1.1.0

第 4 步：完成！
  → GitHub Actions 自動構建和發佈
  → 訪問 GitHub Releases 查看


發佈檢查清單
────────────────────────────────────────────────────────────────────────────

發佈前確認:

代碼檢查
  ☐ 所有測試通過
  ☐ 代碼已審查
  ☐ 沒有 console.log 語句
  ☐ 沒有調試代碼

文檔檢查
  ☐ README 已更新
  ☐ CHANGELOG 已更新
  ☐ API 文檔已更新

安全檢查
  ☐ 依賴已更新 (npm audit)
  ☐ 沒有已知漏洞
  ☐ 密鑰未提交到 Git
  ☐ 隱私政策已檢查

構建檢查
  ☐ iOS 構建通過
  ☐ macOS 構建通過
  ☐ Windows 構建通過
  ☐ Linux 構建通過

簽名檢查
  ☐ 代碼簽名正確
  ☐ 證書未過期
  ☐ 校驗和已生成

發佈檢查
  ☐ 版本號正確
  ☐ 標籤已創建
  ☐ GitHub Releases 已生成
  ☐ 下載鏈接有效


═══════════════════════════════════════════════════════════════════════════════

🔐 第 5 部分：簽名和公證
═══════════════════════════════════════════════════════════════════════════════

iOS 代碼簽名
────────────────────────────────────────────────────────────────────────────

自動簽名 (推薦):
  1. Xcode 中選擇「Automatically manage signing」
  2. 確認 Team 已設置
  3. 構建時自動簽名

手動簽名:
  $ codesign -s "Developer ID Application" build/RemoteAIGuardian.app


macOS 代碼簽名和公證
────────────────────────────────────────────────────────────────────────────

設置開發者帳號:
  1. 註冊 Apple Developer Program
  2. 下載開發者證書
  3. 在 Keychain 中安裝

GitHub Secrets 配置:
  Settings → Secrets and variables → Actions
  
  添加以下 secrets:
  - APPLE_ID: your-apple-id@example.com
  - APPLE_ID_PASSWORD: your-app-specific-password
  - ASC_PROVIDER: your-team-id
  - MAC_CERTIFICATE: (base64 encoded .p12)
  - MAC_CERTIFICATE_PWD: certificate-password

自動公證 (在 build-macos-app.yml 中):
  beforeSign hook 自動執行公證
  無需手動操作


Windows 代碼簽名
────────────────────────────────────────────────────────────────────────────

獲取代碼簽名證書:
  1. 前往 https://www.sectigo.com 或類似提供商
  2. 購買 Code Signing Certificate
  3. 費用: ~$300-500/年

設置簽名:
  1. 將 .pfx 文件轉為 base64
  2. 在 GitHub Secrets 中添加
  3. electron-builder 自動簽名


═══════════════════════════════════════════════════════════════════════════════

🚀 第 6 部分：快速開始指南
═══════════════════════════════════════════════════════════════════════════════

情景 1：我只想在 Windows 上開發，不需要構建 macOS
────────────────────────────────────────────────────────────────────────────

✅ 推薦方案：GitHub Actions + 遠程 Mac

步驟:
  1. 在 GitHub 上創建倉庫
  2. 推送代碼
  3. GitHub Actions 在 macOS runner 上自動構建
  4. 下載構件

無需在本地安裝 macOS！


情景 2：我需要在本地測試 iOS 構建
────────────────────────────────────────────────────────────────────────────

✅ 推薦方案：購買 Mac mini 或使用 MacStadium

步驟:
  1. 在 Mac 上克隆倉庫
  2. 安裝 Xcode
  3. 運行構建腳本
  4. 測試應用

成本: ~$600 (一次性購買) 或 ~$1/小時 (MacStadium)


情景 3：我想完全自動化的發佈流程
────────────────────────────────────────────────────────────────────────────

✅ 推薦方案：GitHub Actions 完整工作流

設置步驟:
  1. 推送代碼到 main 分支
  2. GitHub Actions 自動測試和構建
  3. 創建版本標籤: git tag v1.1.0
  4. 推送標籤: git push origin v1.1.0
  5. GitHub Actions 自動:
     • 在所有平台構建
     • 生成發佈頁面
     • 上傳所有構件
     • 生成校驗和和變更日誌

完全自動化，零手動操作！


情景 4：我想支援離線構建
────────────────────────────────────────────────────────────────────────────

✅ 推薦方案：本地構建腳本

步驟:
  1. 下載依賴:
     npm install --offline
  
  2. 運行構建:
     bash scripts/build.sh 1.1.0
  
  3. 生成離線構件:
     dist/ 目錄中的所有文件
  
  4. 上傳到發佈平台


════════════════════════════════════════════════════════════════════════════════

📊 構建工具對比
════════════════════════════════════════════════════════════════════════════════

構建方式        推薦度  成本    難度   自動化  平台支援  簽名支持
─────────────────────────────────────────────────────────────────────────────
GitHub Actions  ⭐⭐⭐  免費   ⭐    完全   所有    支持
本地 Mac        ⭐⭐   $600+  ⭐⭐  無    iOS/mac 支持
MacStadium      ⭐⭐⭐  ~$1/h  ⭐    無    iOS/mac 支持
Docker          ⭐     免費   ⭐⭐⭐ 完全   Linux   不支持
虛擬機          ⭐     $80+   ⭐⭐⭐ 無    所有    受限


════════════════════════════════════════════════════════════════════════════════

📚 資源和文檔
════════════════════════════════════════════════════════════════════════════════

本地文檔:
  • MACOS_SETUP_GUIDE.md
  • PACKAGING_AND_DISTRIBUTION.md
  • .github/workflows/build-ios-app.yml
  • .github/workflows/build-macos-app.yml
  • .github/workflows/release.yml

外部資源:
  • GitHub Actions 文檔: https://docs.github.com/en/actions
  • Electron Builder: https://www.electron.build/
  • Xcode Build: https://help.apple.com/xcode/
  • Apple Code Signing: https://developer.apple.com/


════════════════════════════════════════════════════════════════════════════════

✅ 總結
════════════════════════════════════════════════════════════════════════════════

在 Windows 上構建 iOS/macOS 應用的最佳方式：

1. ✅ 完全合法
   使用 GitHub Actions (官方支持)

2. ✅ 完全免費
   免費的 macOS runner (3000分鐘/月)

3. ✅ 完全自動化
   推送代碼 → 自動構建 → 自動發佈

4. ✅ 零配置
   所有工作流已預先配置

5. ✅ 多平台
   一次點擊構建 iOS、macOS、Windows、Linux


不要浪費時間在虛擬機或違反法律的方案上！
使用 GitHub Actions，今天就開始發佈你的應用。


════════════════════════════════════════════════════════════════════════════════

🚀 立即開始
════════════════════════════════════════════════════════════════════════════════

第 1 步：創建 GitHub 倉庫
  $ git init
  $ git add .
  $ git commit -m "Initial commit"
  $ git remote add origin https://github.com/you/repo.git
  $ git push -u origin main

第 2 步：查看自動構建
  訪問 https://github.com/you/repo/actions

第 3 步：創建第一個發佈
  $ git tag v1.0.0
  $ git push origin v1.0.0

完成！GitHub Actions 現在為你構建和發佈應用。


════════════════════════════════════════════════════════════════════════════════

版本: 1.0.0
最後更新: 2026/02/15
狀態: ✅ 生產就緒

需要幫助？查看 PACKAGING_AND_DISTRIBUTION.md 或提交 GitHub Issue。

════════════════════════════════════════════════════════════════════════════════
