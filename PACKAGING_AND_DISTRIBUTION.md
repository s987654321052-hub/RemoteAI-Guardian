# RemoteAI Guardian - 完整打包和發佈指南

## 📋 目錄

1. [快速開始](#快速開始)
2. [本地構建](#本地構建)
3. [GitHub Actions 自動化](#github-actions-自動化)
4. [多平台支援](#多平台支援)
5. [簽名和公證](#簽名和公證)
6. [發佈流程](#發佈流程)
7. [版本管理](#版本管理)

---

## 🚀 快速開始

### 一鍵發佈流程

```bash
# 1. 更新版本號
./scripts/bump-version.sh v1.1.0

# 2. 創建發佈標籤
git tag v1.1.0
git push origin v1.1.0

# 3. GitHub Actions 自動構建並發佈
# 查看: https://github.com/your-repo/actions
```

---

## 🔨 本地構建

### 前置要求

```bash
# Node.js 20+
node --version

# macOS (用於 iOS/macOS 構建)
xcode-select --install

# 其他工具
brew install gh  # GitHub CLI
```

### iOS 構建

```bash
cd iOS

# 1. 構建模擬器版本
xcodebuild \
  -scheme RemoteAIGuardian \
  -configuration Release \
  -sdk iphonesimulator \
  -derivedDataPath build \
  build

# 2. 構建設備版本
xcodebuild \
  -scheme RemoteAIGuardian \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath build \
  build

# 3. 創建歸檔用於 App Store
xcodebuild \
  -scheme RemoteAIGuardian \
  -configuration Release \
  -sdk iphoneos \
  -derivedDataPath build \
  archive \
  -archivePath build/RemoteAIGuardian.xcarchive

# 4. 導出 IPA
xcodebuild \
  -exportArchive \
  -archivePath build/RemoteAIGuardian.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/ipa
```

### macOS 構建

```bash
cd auth-system

# 1. 安裝構建工具
npm install --save-dev electron electron-builder

# 2. 構建 DMG
npx electron-builder --mac dmg

# 3. 輸出位置: build/RemoteAIGuardian.dmg
```

### Windows 構建

```bash
cd auth-system

# 1. 安裝構建工具
npm install --save-dev electron electron-builder

# 2. 構建可執行檔
npx electron-builder --win

# 3. 輸出位置: build/RemoteAIGuardian.exe
```

### Linux 構建

```bash
cd auth-system

# 1. 安裝構建工具
npm install --save-dev electron electron-builder

# 2. 構建 AppImage 和 DEB
npx electron-builder --linux AppImage deb

# 3. 輸出位置: build/*.AppImage, build/*.deb
```

---

## 🤖 GitHub Actions 自動化

### 設置 GitHub Actions

```bash
# 1. 確保 workflows 已存在
ls -la .github/workflows/

# 2. 推送到 GitHub
git push origin main

# 3. GitHub Actions 自動執行
# 查看: https://github.com/your-repo/actions
```

### 觸發構建

```bash
# 方式 1: 推送代碼
git add .
git commit -m "feat: new feature"
git push origin main

# 方式 2: 創建標籤 (自動創建發佈)
git tag v1.1.0
git push origin v1.1.0

# 方式 3: 手動觸發
gh workflow run release.yml -f version=v1.1.0
```

### 查看構建狀態

```bash
# 查看所有工作流
gh workflow list

# 查看特定工作流運行
gh run list --workflow=build-macos-app.yml

# 查看特定運行的詳細信息
gh run view <run-id>

# 查看工作流日誌
gh run view <run-id> --log
```

---

## 🌍 多平台支援

### 平台特定配置

#### iOS

**ExportOptions.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>stripBitcode</key>
    <false/>
</dict>
</plist>
```

#### macOS

**electron-builder.yml:**
```yaml
appId: com.remoteai.guardian
productName: RemoteAI Guardian

mac:
  target:
    - dmg
    - zip
  category: public.app-category.productivity
  signing:
    identity: 'Developer ID Application: Your Name (TEAM_ID)'

dmg:
  contents:
    - x: 110
      y: 150
      type: file
      path: RemoteAIGuardian.app
    - x: 240
      y: 150
      type: link
      path: /Applications
```

#### Windows

```yaml
win:
  target:
    - nsis
    - portable
  certificateFile: path/to/certificate.pfx
  certificatePassword: ${{ secrets.WIN_CSC_KEY_PASSWORD }}

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

#### Linux

```yaml
linux:
  target:
    - AppImage
    - deb
  category: Utilities
```

---

## 🔐 簽名和公證

### macOS 簽名

```bash
# 1. 導入開發者證書
security import certificate.p12 -k ~/Library/Keychains/login.keychain -P ''

# 2. 設置簽名標識
export APPLEID="your-apple-id@example.com"
export APPLEIDPASS="your-app-specific-password"
export ASC_PROVIDER="your-team-id"

# 3. 構建和簽名
npx electron-builder --mac dmg

# 4. 公證應用 (可選，對 App Store 不需要)
xcrun altool --notarize-app -f build/RemoteAIGuardian.dmg \
  -t osx \
  --username "$APPLEID" \
  --password "$APPLEIDPASS" \
  --primary-bundle-id com.remoteai.guardian
```

### Windows 簽名

```batch
REM 1. 設置證書路徑
set WIN_CSC_LINK=C:\path\to\certificate.pfx
set WIN_CSC_KEY_PASSWORD=your-password

REM 2. 構建
npx electron-builder --win

REM 3. 手動簽名 (可選)
signtool sign /f certificate.pfx /p password /t http://timestamp.server /d "RemoteAI Guardian" build\RemoteAIGuardian.exe
```

### GitHub Secrets 配置

在 GitHub 倉庫設置中添加：

```
APPLE_ID              = your-apple-id@example.com
APPLE_ID_PASSWORD     = your-app-specific-password
ASC_PROVIDER          = your-team-id
MAC_CERTIFICATE       = (base64 encoded .p12 file)
MAC_CERTIFICATE_PWD   = certificate-password
WIN_CSC_LINK          = (base64 encoded .pfx file)
WIN_CSC_KEY_PASSWORD  = certificate-password
```

---

## 📦 發佈流程

### 方式 1: GitHub Releases

```bash
# 1. 創建發佈標籤
git tag v1.1.0
git push origin v1.1.0

# 2. GitHub Actions 自動創建發佈並上傳構件
# 3. 訪問: https://github.com/your-repo/releases

# 4. 編輯發佈說明
gh release edit v1.1.0 -n "Release notes..."
```

### 方式 2: TestFlight (iOS)

```bash
# 1. 上傳到 TestFlight
xcrun altool --upload-app -f build/ipa/RemoteAIGuardian.ipa \
  -t ios \
  --username "$APPLEID" \
  --password "$APPLEIDPASS"

# 2. 在 App Store Connect 中添加測試者
# 3. 等待 Apple 批准 (通常 24-48 小時)
```

### 方式 3: App Store (iOS/macOS)

```bash
# 1. 在 App Store Connect 中準備
# https://appstoreconnect.apple.com

# 2. 上傳構件
xcrun altool --upload-app -f build/ipa/RemoteAIGuardian.ipa \
  -t ios \
  --username "$APPLEID" \
  --password "$APPLEIDPASS"

# 3. 填寫應用信息
# - 描述、截圖、分類等
# - 定價和可用性

# 4. 提交審核
# - 審查期通常 24-48 小時
```

### 方式 4: 直接下載

```bash
# 1. 建立發佈下載網站
mkdir -p releases
cp build/* releases/

# 2. 上傳到伺服器
scp -r releases/ user@your-server.com:/var/www/

# 3. 分享下載鏈接
https://your-domain.com/releases/RemoteAIGuardian.dmg
```

---

## 📌 版本管理

### 語義化版本

```
v{MAJOR}.{MINOR}.{PATCH}
v1.2.3

MAJOR: 不兼容的 API 更改
MINOR: 新增功能 (向後兼容)
PATCH: 錯誤修正
```

### 自動化版本更新

```bash
#!/bin/bash
# scripts/bump-version.sh

NEW_VERSION=$1

# 更新 package.json
npm version $NEW_VERSION --no-git-tag-version

# 更新 iOS Info.plist
/usr/libexec/PlistBuddy -c "Set :CFBundleShortVersionString $NEW_VERSION" iOS/RemoteAIGuardian/Info.plist

# 提交更改
git add .
git commit -m "chore: bump version to $NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main --tags
```

### 變更日誌

```bash
#!/bin/bash
# scripts/generate-changelog.sh

PREV_TAG=$(git describe --tags --abbrev=0)
CURR_TAG=$1

echo "# Changelog for $CURR_TAG" > CHANGELOG.md
echo "" >> CHANGELOG.md
echo "## Changes" >> CHANGELOG.md

git log $PREV_TAG..$CURR_TAG --pretty=format:"- %h: %s" >> CHANGELOG.md

echo "" >> CHANGELOG.md
echo "## Contributors" >> CHANGELOG.md
git shortlog -sn $PREV_TAG..$CURR_TAG >> CHANGELOG.md
```

---

## ✅ 發佈檢查清單

發佈前確認：

```bash
# 代碼檢查
- [ ] 所有測試通過
- [ ] 代碼已審查
- [ ] 沒有 console.log 語句
- [ ] 沒有調試代碼

# 文檔檢查
- [ ] README 已更新
- [ ] 變更日誌已更新
- [ ] API 文檔已更新
- [ ] 故障排除文檔已更新

# 安全檢查
- [ ] 依賴已更新
- [ ] 沒有已知漏洞
- [ ] 密鑰未提交
- [ ] 隱私政策已檢查

# 性能檢查
- [ ] 應用大小優化
- [ ] 啟動時間檢查
- [ ] 內存使用檢查
- [ ] 電池使用檢查

# 平台檢查
- [ ] iOS 構建通過
- [ ] macOS 構建通過
- [ ] Windows 構建通過
- [ ] Linux 構建通過

# 簽名檢查
- [ ] 代碼簽名正確
- [ ] 證書未過期
- [ ] 公證完成（如適用）
- [ ] 時間戳正確

# 發佈檢查
- [ ] 版本號正確
- [ ] 標籤已創建
- [ ] GitHub Releases 已生成
- [ ] 下載鏈接有效
```

---

## 📊 發佈儀表板腳本

```bash
#!/bin/bash
# scripts/release-dashboard.sh

echo "═══════════════════════════════════════════"
echo "  RemoteAI Guardian - 發佈儀表板"
echo "═══════════════════════════════════════════"
echo ""

# 當前版本
CURRENT_VERSION=$(cat auth-system/package.json | grep version | head -1 | sed 's/.*: "\(.*\)".*/\1/')
echo "📌 當前版本: v$CURRENT_VERSION"
echo ""

# 最新標籤
LATEST_TAG=$(git describe --tags --abbrev=0)
echo "🏷️  最新標籤: $LATEST_TAG"
echo ""

# 待發佈更改
COMMITS=$(git log $LATEST_TAG..HEAD --oneline | wc -l)
echo "📝 待發佈提交: $COMMITS"
git log $LATEST_TAG..HEAD --oneline | head -5
echo ""

# 構件信息
echo "📦 可用構件:"
ls -lh build/* 2>/dev/null || echo "  (無構件，請先構建)"
echo ""

# GitHub Actions 狀態
echo "🔄 最近的工作流運行:"
gh run list --limit 5 --json status,name,displayTitle
echo ""

# 發佈選項
echo "🚀 發佈選項:"
echo "  1. npm run release:patch     # 修補版本 (1.0.0 -> 1.0.1)"
echo "  2. npm run release:minor     # 次要版本 (1.0.0 -> 1.1.0)"
echo "  3. npm run release:major     # 主要版本 (1.0.0 -> 2.0.0)"
```

---

## 📞 故障排除

### 構建失敗

```bash
# 1. 清理構建
rm -rf build/
rm -rf auth-system/build/

# 2. 清理緩存
npm cache clean --force
pod repo update  # iOS

# 3. 重新構建
npm install
npm run build
```

### 簽名問題

```bash
# 1. 檢查簽名標識
security find-identity -v -p codesigning

# 2. 刷新證書
security delete-identity -c "Developer ID"
security import certificate.p12 -k ~/Library/Keychains/login.keychain

# 3. 檢查環境變數
echo $APPLE_ID
echo $ASC_PROVIDER
```

### GitHub Actions 失敗

```bash
# 1. 查看日誌
gh run view <run-id> --log

# 2. 檢查 secrets
gh secret list

# 3. 測試本地構建
npm run build

# 4. 提交修正後重試
gh run retry <run-id>
```

---

## 🎓 推薦資源

- [Electron Builder 文檔](https://www.electron.build/)
- [Xcode Build Settings](https://help.apple.com/xcode/mac/current/#/devd7b94c5d3)
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Apple Notarization](https://developer.apple.com/documentation/notaryapi)

---

**最後更新**: 2026/02/15  
**版本**: 1.0.0  
**狀態**: ✅ 生產就緒

需要幫助？查看 `.github/workflows/` 目錄中的工作流文件。
