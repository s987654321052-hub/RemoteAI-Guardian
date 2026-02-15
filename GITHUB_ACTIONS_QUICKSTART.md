╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                  GitHub Actions 快速開始指南 (5-10 分鐘)                   ║
║                                                                            ║
║            零代碼配置，自動化構建和發佈你的應用                            ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝


🎯 5 分鐘快速開始
════════════════════════════════════════════════════════════════════════════

第 1 步：進入項目目錄
────────────────────────────────────────────────────────────────────────────
$ cd C:\RemoteAI-Guardian

或在 PowerShell 中：
$ Set-Location C:\RemoteAI-Guardian


第 2 步：初始化 Git 倉庫
────────────────────────────────────────────────────────────────────────────
$ git init
$ git add .
$ git commit -m "Initial commit: RemoteAI Guardian v1.0.0"


第 3 步：創建 GitHub 倉庫並推送
────────────────────────────────────────────────────────────────────────────

方式 A：用 GitHub 網頁 (最簡單)
  1. 打開 https://github.com/new
  2. Repository name: RemoteAI-Guardian
  3. 勾選 "Public" (這樣 GitHub Actions 免費)
  4. 點擊「Create repository」
  5. 複製命令行指令並在本地執行

方式 B：用 GitHub CLI (推薦)
  $ gh auth login          # 首次登錄
  $ gh repo create RemoteAI-Guardian --public --source=. --push


第 4 步：查看自動構建
────────────────────────────────────────────────────────────────────────────
訪問：https://github.com/YOUR_USERNAME/RemoteAI-Guardian/actions

你會看到 GitHub Actions 自動運行！


🎉 就這樣！所有複雜的事都自動處理了。


════════════════════════════════════════════════════════════════════════════
═ 詳細步驟指南
════════════════════════════════════════════════════════════════════════════


📋 第 1 部分：準備 GitHub
════════════════════════════════════════════════════════════════════════════

如果你還沒有 GitHub 帳號
────────────────────────────────────────────────────────────────────────────

1️⃣ 前往 https://github.com
2️⃣ 點擊「Sign up」
3️⃣ 輸入郵箱、密碼、用戶名
4️⃣ 驗證郵箱
5️⃣ 完成！


如果你已有 GitHub 帳號
────────────────────────────────────────────────────────────────────────────

直接進入第 2 部分


════════════════════════════════════════════════════════════════════════════

📁 第 2 部分：初始化本地 Git
════════════════════════════════════════════════════════════════════════════

在 Windows 上的步驟
────────────────────────────────────────────────────────────────────────────

打開 PowerShell 或 Git Bash：

$ cd C:\RemoteAI-Guardian

$ git init

$ git config user.name "Your Name"
$ git config user.email "your-email@example.com"

$ git add .

$ git commit -m "Initial commit: RemoteAI Guardian v1.0.0"

$ git branch -M main  # 確保分支名是 main


════════════════════════════════════════════════════════════════════════════

🌐 第 3 部分：創建 GitHub 倉庫
════════════════════════════════════════════════════════════════════════════

方式 1：GitHub 網頁 (推薦新手)
────────────────────────────────────────────────────────────────────────────

步驟：
1. 打開 https://github.com/new
2. 填寫表單：
   • Repository name: RemoteAI-Guardian
   • Description: AI-powered remote execution system
   • 選擇「Public」(GitHub Actions 免費)
   • 勾選「Add a README file」(可選)
3. 點擊「Create repository」
4. 複製給出的 Git 命令

執行命令 (會顯示類似這樣的):
────────────────────────────────────────────────────────────────────────────
$ git remote add origin https://github.com/YOUR_USERNAME/RemoteAI-Guardian.git
$ git branch -M main
$ git push -u origin main


方式 2：GitHub CLI (推薦開發者)
────────────────────────────────────────────────────────────────────────────

首先安裝 GitHub CLI：https://cli.github.com/

然後執行：
$ gh auth login              # 登錄 GitHub
$ gh repo create RemoteAI-Guardian --public --source=. --push

完成！你的倉庫已創建並推送。


════════════════════════════════════════════════════════════════════════════

✅ 第 4 部分：驗證工作流
════════════════════════════════════════════════════════════════════════════

檢查工作流是否自動觸發
────────────────────────────────────────────────────────────────────────────

1. 打開你的倉庫：
   https://github.com/YOUR_USERNAME/RemoteAI-Guardian

2. 點擊「Actions」標籤

3. 你應該看到工作流自動運行：
   ✓ Build iOS App
   ✓ Build macOS App

4. 如果沒有看到，檢查：
   ✓ 工作流文件是否在 .github/workflows/ 目錄
   ✓ 文件是否已正確推送
   ✓ Actions 是否已啟用 (Settings → Actions)


════════════════════════════════════════════════════════════════════════════

🔐 第 5 部分：配置 Secrets (可選但推薦)
════════════════════════════════════════════════════════════════════════════

什麼是 Secrets？
────────────────────────────────────────────────────────────────────────────
Secrets 用於存儲敏感信息（密碼、令牌等）
這些信息在 GitHub Actions 運行時使用，但不會在日誌中顯示


添加 Secrets 的步驟
────────────────────────────────────────────────────────────────────────────

1. 進入倉庫設置：
   https://github.com/YOUR_USERNAME/RemoteAI-Guardian/settings/secrets/actions

2. 點擊「New repository secret」

3. 根據需要添加以下 Secrets：

【基礎配置】(推薦)
   Name: NODE_VERSION
   Value: 20

   Name: XCODE_VERSION
   Value: latest

【iOS 構建】(如果構建 iOS)
   Name: APPLE_ID
   Value: your-apple-id@example.com
   
   Name: APPLE_ID_PASSWORD
   Value: (from appleid.apple.com → App Passwords)
   
   Name: ASC_PROVIDER
   Value: your-team-id

【macOS 簽名】(如果需要簽名)
   Name: MAC_CERTIFICATE
   Value: (base64 encoded .p12 file)
   
   Name: MAC_CERTIFICATE_PWD
   Value: your-certificate-password

【Slack 通知】(可選)
   Name: SLACK_WEBHOOK
   Value: https://hooks.slack.com/services/...


如何獲取 App-Specific Password
────────────────────────────────────────────────────────────────────────────
1. 訪問 https://appleid.apple.com
2. 登錄
3. Security → App Passwords
4. 選擇應用和設備
5. 生成密碼
6. 複製 16 位密碼到 GitHub Secrets


════════════════════════════════════════════════════════════════════════════

🚀 第 6 部分：觸發構建
════════════════════════════════════════════════════════════════════════════

方式 1：推送代碼自動構建 (推薦用於開發)
────────────────────────────────────────────────────────────────────────────

$ echo "# Updated" >> README.md
$ git add README.md
$ git commit -m "Update README"
$ git push origin main

GitHub Actions 會自動運行（等待 1-2 分鐘）


方式 2：創建版本標籤 (推薦用於發佈)
────────────────────────────────────────────────────────────────────────────

$ git tag v1.0.0
$ git push origin v1.0.0

這會觸發完整的發佈流程，包括：
✓ 在所有平台構建
✓ 生成 Releases 頁面
✓ 上傳所有構件


方式 3：手動觸發 (在網頁上)
────────────────────────────────────────────────────────────────────────────

1. 打開 https://github.com/YOUR_USERNAME/RemoteAI-Guardian/actions
2. 左側選擇一個工作流
3. 點擊「Run workflow」按鈕
4. 選擇分支
5. 點擊「Run workflow」


════════════════════════════════════════════════════════════════════════════

📊 第 7 部分：監控和下載
════════════════════════════════════════════════════════════════════════════

實時查看構建進度
────────────────────────────────────────────────────────────────────────────

網頁方式 (推薦):
  https://github.com/YOUR_USERNAME/RemoteAI-Guardian/actions

命令行方式:
  $ gh run list
  $ gh run view <run-id> --log


下載構件
────────────────────────────────────────────────────────────────────────────

方式 1：從 Actions 頁面
  1. 點擊完成的工作流運行
  2. 向下滾動到「Artifacts」
  3. 點擊下載

方式 2：從 Releases 頁面 (推薦)
  https://github.com/YOUR_USERNAME/RemoteAI-Guardian/releases
  
  下載你想要的文件：
  • iOS:     RemoteAIGuardian-*.ipa
  • macOS:   RemoteAIGuardian-*.dmg
  • Windows: RemoteAIGuardian-*.exe
  • Linux:   RemoteAIGuardian-*.AppImage, *.deb

方式 3：用 CLI
  $ gh run download <run-id> -D ./downloads/


════════════════════════════════════════════════════════════════════════════

❌ 故障排除
════════════════════════════════════════════════════════════════════════════

問題 1：工作流不運行
────────────────────────────────────────────────────────────────────────────

症狀：推送代碼後 Actions 頁面沒有新的運行

解決方案：
  1. 檢查工作流文件是否存在：
     ls -la .github/workflows/
  
  2. 檢查文件是否已推送：
     git log --all --oneline -- .github/workflows/
  
  3. 檢查 Actions 是否啟用：
     Settings → Actions → General
     確認「Allow all actions」已選中
  
  4. 重新推送：
     git push origin main --force


問題 2：構建失敗
────────────────────────────────────────────────────────────────────────────

症狀：工作流顯示 ❌

解決方案：
  1. 點擊失敗的運行
  2. 展開失敗的步驟查看錯誤信息
  3. 根據錯誤信息調整代碼或配置
  4. 重新推送觸發新的運行


問題 3：簽名失敗 (certificate_id not found)
────────────────────────────────────────────────────────────────────────────

症狀：構建失敗，錯誤信息提到證書

解決方案：
  1. 檢查 Secrets 是否正確設置
  2. 確認 APPLE_ID_PASSWORD 是有效的
  3. 重新生成 App-Specific Password
  4. 更新 GitHub Secrets
  5. 重新運行工作流


問題 4：超時 (timeout)
────────────────────────────────────────────────────────────────────────────

症狀：工作流超過 6 小時被強制停止

解決方案：
  1. 優化構建流程
  2. 並行化構建步驟
  3. 使用緩存加速
  4. 查看是否有不必要的步驟


════════════════════════════════════════════════════════════════════════════

📈 監控和統計
════════════════════════════════════════════════════════════════════════════

查看 GitHub Actions 使用情況
────────────────────────────────────────────────────────────────────────────

訪問：Settings → Billing and plans → Actions

你會看到：
• 本月使用的分鐘數
• 存儲使用情況
• 免費額度限制

免費額度：
• 公開倉庫：無限制 ✓
• 私有倉庫：3000 分鐘/月 + 1GB 存儲


查看構建歷史
────────────────────────────────────────────────────────────────────────────

$ gh run list --limit 20
$ gh run view <run-id> --json status,durationMinutes,conclusion


════════════════════════════════════════════════════════════════════════════

🎓 常用命令速查
════════════════════════════════════════════════════════════════════════════

# 列出所有工作流
$ gh workflow list

# 觸發特定工作流
$ gh workflow run build-macos-app.yml

# 查看最近的運行
$ gh run list

# 查看特定運行的詳情
$ gh run view <run-id>

# 查看運行的日誌
$ gh run view <run-id> --log

# 下載構件
$ gh run download <run-id>

# 重新運行失敗的工作流
$ gh run rerun <run-id>

# 取消正在運行的工作流
$ gh run cancel <run-id>


════════════════════════════════════════════════════════════════════════════

✅ 完整檢查清單
════════════════════════════════════════════════════════════════════════════

GitHub Actions 設置檢查清單：

□ 創建 GitHub 帳號
□ 安裝 Git (https://git-scm.com)
□ 初始化本地 Git 倉庫
□ 創建 GitHub 倉庫
□ 推送代碼到 GitHub
□ 驗證工作流文件存在 (.github/workflows/*.yml)
□ 檢查工作流是否自動運行
□ 添加必要的 Secrets
□ 測試工作流運行
□ 查看構建日誌
□ 下載和驗證構件
□ (可選) 配置 Slack 通知


════════════════════════════════════════════════════════════════════════════

🔗 下一步
════════════════════════════════════════════════════════════════════════════

1. ✅ 完成基本設置
   參考：GITHUB_ACTIONS_SETUP.md

2. 📦 自動發佈應用
   • 創建版本標籤
   • 上傳到 TestFlight/App Store
   • 參考：PACKAGING_AND_DISTRIBUTION.md

3. 📧 設置通知
   • Slack 通知
   • 郵件通知

4. 🔒 配置代碼簽名
   • Apple 代碼簽名
   • Windows 代碼簽名

5. 🚀 優化工作流
   • 添加測試
   • 添加代碼掃描
   • 性能監測


════════════════════════════════════════════════════════════════════════════

📚 資源鏈接
════════════════════════════════════════════════════════════════════════════

• GitHub Actions 文檔
  https://docs.github.com/en/actions

• GitHub CLI
  https://cli.github.com/

• Electron Builder
  https://www.electron.build/

• Apple Developer
  https://developer.apple.com/

• Xcode
  https://developer.apple.com/xcode/


════════════════════════════════════════════════════════════════════════════

💬 需要幫助？
════════════════════════════════════════════════════════════════════════════

1. 查看詳細文檔
   • GITHUB_ACTIONS_SETUP.md
   • PACKAGING_AND_DISTRIBUTION.md

2. 運行自動化設置腳本
   $ bash scripts/github-actions-setup.sh

3. 查看工作流文件
   • .github/workflows/build-ios-app.yml
   • .github/workflows/build-macos-app.yml
   • .github/workflows/release.yml

4. 提交 GitHub Issue
   https://github.com/YOUR_USERNAME/RemoteAI-Guardian/issues


════════════════════════════════════════════════════════════════════════════

版本: 1.0.0
最後更新: 2026/02/15
狀態: ✅ 完全就緒

祝你使用 GitHub Actions 順利！🚀

════════════════════════════════════════════════════════════════════════════
