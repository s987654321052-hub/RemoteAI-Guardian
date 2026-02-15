# 使用 GitHub Actions 完整步驟指南

## 📋 目錄

1. [GitHub 帳號準備](#github-帳號準備)
2. [創建並配置倉庫](#創建並配置倉庫)
3. [配置 Secrets](#配置-secrets)
4. [工作流驗證](#工作流驗證)
5. [觸發構建](#觸發構建)
6. [下載和發佈](#下載和發佈)
7. [故障排除](#故障排除)

---

## 🔧 GitHub 帳號準備

### 步驟 1：確保你有 GitHub 帳號

1. 前往 https://github.com
2. 如果沒有帳號，點擊「Sign up」創建
3. 驗證郵箱

### 步驟 2：生成個人訪問令牌 (Personal Access Token)

1. 登錄 GitHub
2. 點擊頭像 → Settings
3. 左側菜單 → Developer settings
4. Personal access tokens → Tokens (classic)
5. 點擊「Generate new token (classic)」
6. 配置如下：

```
Token name: GitHub Actions Builder
Expiration: 90 days (or No expiration)

勾選以下 scopes:
☑ repo (完整控制)
☑ workflow (管理 GitHub Actions 和工作流)
☑ write:packages (寫入包)
☑ read:packages (讀取包)
```

7. 點擊「Generate token」
8. **複製令牌** (⚠️ 只會顯示一次！)

---

## 📁 創建並配置倉庫

### 步驟 1：創建新倉庫

```bash
# 方式 1：在網頁上創建
# 1. 前往 https://github.com/new
# 2. Repository name: RemoteAI-Guardian
# 3. Description: AI-powered remote execution system with iPhone + LINE integration
# 4. Public (推薦，GitHub Actions 免費)
# 5. Add a README file
# 6. Create repository

# 方式 2：用 GitHub CLI 創建
gh repo create RemoteAI-Guardian --public --source=. --remote=origin --push
```

### 步驟 2：初始化本地倉庫

```bash
# 進入項目目錄
cd C:\RemoteAI-Guardian

# 初始化 Git
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: RemoteAI Guardian v1.0.0"

# 添加遠程倉庫
git remote add origin https://github.com/YOUR_USERNAME/RemoteAI-Guardian.git

# 更改分支名為 main (如果不是)
git branch -M main

# 推送到 GitHub
git push -u origin main
```

### 步驟 3：驗證推送成功

```bash
# 查看遠程狀態
git remote -v
# 應該顯示:
# origin  https://github.com/YOUR_USERNAME/RemoteAI-Guardian.git (fetch)
# origin  https://github.com/YOUR_USERNAME/RemoteAI-Guardian.git (push)

# 查看 GitHub 上的文件
# 訪問 https://github.com/YOUR_USERNAME/RemoteAI-Guardian
```

---

## 🔐 配置 Secrets

### 步驟 1：訪問 Secrets 設置

1. 打開你的倉庫
2. 點擊「Settings」
3. 左側菜單 → Secrets and variables
4. 點擊「Actions」

### 步驟 2：添加基礎 Secrets

以下是必需的環境變數，根據你的需求配置：

#### iOS 構建 (可選，如果想構建 iOS)

```
APPLE_ID
值: your-apple-id@example.com

APPLE_ID_PASSWORD
值: your-app-specific-password

ASC_PROVIDER
值: your-team-id (e.g., ABCD123456)
```

**如何獲取 App-Specific Password：**
```
1. 前往 https://appleid.apple.com
2. 登錄
3. Security → App Passwords
4. 選擇應用和設備
5. 生成密碼
6. 複製 16 位密碼
```

#### macOS 代碼簽名 (可選)

```
MAC_CERTIFICATE
值: (base64 encoded .p12 file)

MAC_CERTIFICATE_PWD
值: your-certificate-password
```

**如何獲取 base64 證書：**
```bash
# 在 macOS 上執行
base64 -i certificate.p12 | pbcopy
# 或在 Windows/Linux 上
cat certificate.p12 | base64 | tr -d '\n'
```

#### Windows 代碼簽名 (可選)

```
WIN_CSC_LINK
值: (base64 encoded .pfx file)

WIN_CSC_KEY_PASSWORD
值: your-certificate-password
```

#### Slack 通知 (可選)

```
SLACK_WEBHOOK
值: https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**如何獲取 Slack Webhook：**
```
1. 打開 Slack 工作區
2. 前往 api.slack.com
3. Create an app → From scratch
4. App name: GitHub Actions
5. Pick workspace
6. Features → Incoming Webhooks
7. Add New Webhook to Workspace
8. 選擇頻道
9. Authorize
10. 複製 Webhook URL
```

### 步驟 3：添加可選環境變數

在 Secrets 中添加：

```
NODE_VERSION
值: 20

XCODE_VERSION
值: latest
```

---

## ✅ 工作流驗證

### 步驟 1：檢查工作流文件

進入你的倉庫目錄，確認工作流文件已存在：

```bash
# 檢查工作流文件
ls -la .github/workflows/

# 應該看到:
# build-ios-app.yml
# build-macos-app.yml
# release.yml
```

### 步驟 2：驗證工作流語法

在 GitHub 網頁上：

1. 點擊「Actions」標籤
2. 左側應該看到 3 個工作流：
   - Build iOS App
   - Build macOS App
   - Complete Release Build

3. 如果顯示「No workflows」，確認：
   - 文件在 `.github/workflows/` 目錄
   - 文件擴展名是 `.yml` (不是 `.yaml`)
   - YAML 語法正確 (使用空格，不是 tab)

### 步驟 3：測試工作流

```bash
# 在本地檢查 YAML 語法 (需要 yamllint)
pip install yamllint
yamllint .github/workflows/*.yml

# 或在線檢查
# https://www.yamllint.com/
```

---

## 🚀 觸發構建

### 方式 1：推送代碼自動構建 (推薦用於測試)

```bash
# 修改一個文件
echo "# Updated" >> README.md

# 提交
git add README.md
git commit -m "Update README"

# 推送
git push origin main

# GitHub Actions 自動觸發 (等待 1-2 分鐘)
# 訪問 Actions 標籤查看運行狀態
```

### 方式 2：創建版本標籤自動發佈 (推薦用於發佈)

```bash
# 創建標籤
git tag v1.0.0

# 推送標籤
git push origin v1.0.0

# GitHub Actions 自動觸發完整發佈流程
# 包括構建所有平台和創建 Release
```

### 方式 3：手動觸發工作流

在 GitHub 網頁上：

1. 點擊「Actions」標籤
2. 左側選擇一個工作流 (e.g., "Build macOS App")
3. 點擊「Run workflow」按鈕
4. 選擇分支
5. 點擊「Run workflow」

---

## 📊 查看構建進度

### 實時監控

1. 前往 GitHub 倉庫
2. 點擊「Actions」標籤
3. 查看當前運行的工作流
4. 點擊特定運行查看詳細日誌

### 查看日誌

```bash
# 用 GitHub CLI 查看日誌
gh run list --repo YOUR_USERNAME/RemoteAI-Guardian

# 查看特定運行的日誌
gh run view <run-id> --log

# 查看失敗的運行
gh run list --status=failure --repo YOUR_USERNAME/RemoteAI-Guardian
```

### 成功標誌

構建成功時會看到：

```
✅ Build iOS App completed
✅ Build macOS App completed  
✅ Build Windows App completed
✅ Build Linux App completed
✅ Create Release completed
```

---

## 📦 下載和發佈

### 方式 1：從 Artifacts 下載

```bash
# 在 Actions 頁面
1. 點擊完成的工作流運行
2. 向下滾動到 "Artifacts"
3. 點擊要下載的構件
4. 自動下載 ZIP 文件

# 用 GitHub CLI 下載
gh run download <run-id> -D ./downloads/
```

### 方式 2：從 Releases 下載 (推薦)

```bash
# 1. 訪問 GitHub Releases 頁面
# https://github.com/YOUR_USERNAME/RemoteAI-Guardian/releases

# 2. 查看最新版本
# 所有構件已自動上傳

# 3. 下載想要的文件
# iOS:     RemoteAIGuardian-*.ipa
# macOS:   RemoteAIGuardian-*.dmg
# Windows: RemoteAIGuardian-*.exe
# Linux:   RemoteAIGuardian-*.AppImage, *.deb
```

### 方式 3：上傳到 App Store/TestFlight

TestFlight (iOS 測試):

```bash
# 1. 在 App Store Connect 中創建應用
# https://appstoreconnect.apple.com

# 2. 編輯工作流添加上傳步驟
# (參考 PACKAGING_AND_DISTRIBUTION.md)

# 3. 設置 TestFlight 用戶

# 4. GitHub Actions 自動上傳
```

---

## 📈 監控和統計

### 查看工作流運行時間

```bash
# 列出最近的運行
gh run list --limit 10 --repo YOUR_USERNAME/RemoteAI-Guardian

# 查看詳細信息
gh run view <run-id> --repo YOUR_USERNAME/RemoteAI-Guardian

# 導出統計
gh run list --json durationMinutes,conclusion --repo YOUR_USERNAME/RemoteAI-Guardian > stats.json
```

### 查看費用使用情況

在 GitHub 網頁上：

1. Settings → Billing and plans
2. 向下滾動到「Actions」
3. 查看本月使用的分鐘數

**免費額度：**
- 公開倉庫：無限制
- 私有倉庫：3000 分鐘/月 + 1GB 存儲

---

## 🐛 故障排除

### 工作流不觸發

**症狀：** 推送代碼後沒有看到工作流運行

**解決方案：**

```bash
# 1. 檢查工作流文件是否存在
ls -la .github/workflows/

# 2. 檢查文件是否已推送
git log --all --oneline -- .github/workflows/

# 3. 檢查工作流語法
# 前往 https://www.yamllint.com/

# 4. 檢查是否禁用了 Actions
# Settings → Actions → General
# 確保「Allow all actions and reusable workflows」已選中

# 5. 重新推送
git push origin main --force
```

### 構建失敗

**查看日誌：**

```bash
# 1. GitHub 網頁
# Actions → 選擇失敗的運行 → 查看日誌

# 2. 用 CLI
gh run view <run-id> --log

# 3. 查看特定步驟
# 展開失敗的步驟查看錯誤信息
```

**常見錯誤：**

| 錯誤 | 原因 | 解決方案 |
|------|------|---------|
| `certificate_id not found` | Apple 簽名失敗 | 檢查 APPLE_ID 和密碼 |
| `Failed to download` | 網絡問題 | 重試工作流 |
| `out of memory` | 構件太大 | 優化大小或增加內存 |
| `timeout` | 構建超過 6 小時 | 優化構建流程 |

### 簽名問題

```bash
# 重新生成証書
# 如果 APPLE_ID_PASSWORD 失效:

1. 訪問 https://appleid.apple.com
2. Security → App Passwords
3. 撤銷舊密碼
4. 生成新密碼
5. 更新 GitHub Secrets
6. 重試工作流
```

### 磁盤空間不足

```bash
# 清理舊的運行和構件
gh run delete <run-id>  # 刪除特定運行

# 或在設置中
Settings → Actions → Artifacts and logs
設置更短的保留期
```

---

## 📝 完整檢查清單

設置 GitHub Actions：

- [ ] 創建 GitHub 帳號
- [ ] 生成個人訪問令牌
- [ ] 創建倉庫
- [ ] 推送代碼到 GitHub
- [ ] 添加必需的 Secrets
- [ ] 驗證工作流文件存在
- [ ] 驗證工作流語法
- [ ] 測試工作流運行
- [ ] 查看構建日誌
- [ ] 下載構件
- [ ] 驗證構件完整性
- [ ] 創建版本標籤
- [ ] 查看 Releases 頁面
- [ ] (可選) 配置 Slack 通知

---

## 🎯 常見工作流命令

```bash
# 列出所有工作流
gh workflow list

# 運行特定工作流
gh workflow run build-macos-app.yml --ref main

# 禁用工作流
gh workflow disable build-ios-app.yml

# 啟用工作流
gh workflow enable build-ios-app.yml

# 查看工作流詳情
gh workflow view build-macos-app.yml

# 列出工作流運行
gh run list --workflow=build-macos-app.yml

# 重新運行失敗的工作流
gh run rerun <run-id>

# 取消正在運行的工作流
gh run cancel <run-id>
```

---

## 📚 下一步

1. **配置通知**
   - 添加 Slack 通知 (參考上面的步驟)
   - 設置郵件通知

2. **優化工作流**
   - 添加測試步驟
   - 添加代碼掃描
   - 添加性能監測

3. **自動化發佈**
   - 自動上傳到 TestFlight
   - 自動上傳到 App Store
   - 自動發佈到 GitHub Releases

4. **監控和告警**
   - 設置構建失敗告警
   - 追蹤構建時間
   - 監控費用使用

---

**最後更新**: 2026/02/15  
**版本**: 1.0.0  
**狀態**: ✅ 完整指南
