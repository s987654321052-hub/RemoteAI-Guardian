# Windows 安裝 macOS 虛擬機完整指南

## ⚠️ 重要法律聲明

在 Windows 上運行 macOS 存在法律限制：
- **正式支援**: Apple 官方僅支援在 Apple Silicon Mac 或 Intel Mac 上運行 macOS
- **虛擬化**: 在非 Apple 硬體上運行 macOS 可能違反 Apple 軟體許可協議
- **建議**: 考慮以下合法替代方案：
  - 購買 Mac mini 或 Mac Studio
  - 使用 MacStadium 等雲端 macOS 服務
  - 使用 GitHub Actions 進行 macOS 構建

---

## 方法 1：使用 GitHub Actions (推薦)

這是**最合法且最實用**的方法 - 完全免費用於開源項目

### 優點
✅ 完全合法 - Apple 官方支援  
✅ 無需本地硬體 - 雲端構建  
✅ 自動化流程 - CI/CD 集成  
✅ 免費用於開源 - 3000 分鐘/月  

### 步驟 1：建立 GitHub Workflows

在你的項目根目錄建立文件結構：

```
.github/
└── workflows/
    ├── build-ios-app.yml           # iOS 應用構建
    ├── build-macos-app.yml         # macOS 應用構建
    └── release.yml                 # 發佈流程
```

### 步驟 2：iOS 應用構建 Workflow

建立 `.github/workflows/build-ios-app.yml`：

```yaml
name: Build iOS App

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'iOS/**'
      - '.github/workflows/build-ios-app.yml'
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Xcode
      uses: maxim-lobanov/setup-xcode@v1
      with:
        xcode-version: latest
    
    - name: Install dependencies
      run: |
        cd iOS
        # 如果使用 CocoaPods
        pod install --repo-update
    
    - name: Build iOS App
      run: |
        cd iOS
        xcodebuild \
          -scheme RemoteAIGuardian \
          -configuration Release \
          -sdk iphoneos \
          -derivedDataPath build \
          archive \
          -archivePath build/RemoteAIGuardian.xcarchive
    
    - name: Export IPA
      run: |
        cd iOS
        xcodebuild \
          -exportArchive \
          -archivePath build/RemoteAIGuardian.xcarchive \
          -exportOptionsPlist ExportOptions.plist \
          -exportPath build/ipa
    
    - name: Upload IPA artifact
      uses: actions/upload-artifact@v3
      with:
        name: RemoteAIGuardian.ipa
        path: iOS/build/ipa/RemoteAIGuardian.ipa
    
    - name: Create Release
      if: startsWith(github.ref, 'refs/tags/')
      uses: softprops/action-gh-release@v1
      with:
        files: iOS/build/ipa/RemoteAIGuardian.ipa
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 步驟 3：macOS 應用構建 Workflow

建立 `.github/workflows/build-macos-app.yml`：

```yaml
name: Build macOS App

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'auth-system/**'
      - '.github/workflows/build-macos-app.yml'
  pull_request:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
        cache: 'npm'
        cache-dependency-path: 'auth-system/package-lock.json'
    
    - name: Install dependencies
      run: |
        cd auth-system
        npm install
    
    - name: Run tests
      run: |
        cd auth-system
        npm run test-integration || true
    
    - name: Build macOS App (using electron-builder)
      run: |
        cd auth-system
        npm run build:mac
    
    - name: Code sign and notarize (optional)
      run: |
        # 代碼簽名步驟 - 需要 Apple 開發者帳號
        codesign -s - --deep auth-system/build/*.app
    
    - name: Create DMG
      run: |
        cd auth-system
        hdiutil create -volname "RemoteAI Guardian" \
          -srcfolder build/RemoteAIGuardian.app \
          -ov -format UDZO build/RemoteAIGuardian.dmg
    
    - name: Upload DMG artifact
      uses: actions/upload-artifact@v3
      with:
        name: RemoteAIGuardian.dmg
        path: auth-system/build/RemoteAIGuardian.dmg
    
    - name: Create Release
      if: startsWith(github.ref, 'refs/tags/')
      uses: softprops/action-gh-release@v1
      with:
        files: auth-system/build/RemoteAIGuardian.dmg
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 步驟 4：完整發佈 Workflow

建立 `.github/workflows/release.yml`：

```yaml
name: Release

on:
  push:
    tags:
      - 'v*.*.*'
  workflow_dispatch:

jobs:
  create-release:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Get version from tag
      id: version
      run: echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT
    
    - name: Create Release Notes
      run: |
        echo "## Release ${{ steps.version.outputs.VERSION }}" > RELEASE_NOTES.md
        echo "" >> RELEASE_NOTES.md
        echo "### Changes" >> RELEASE_NOTES.md
        git log $(git describe --tags --abbrev=0)..HEAD --oneline >> RELEASE_NOTES.md
    
    - name: Create Release
      uses: softprops/action-gh-release@v1
      with:
        body_path: RELEASE_NOTES.md
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 方法 2：KVM + QEMU (Linux 用戶可用)

如果你使用 WSL2 或 Hyper-V，可以考慮 KVM：

### 要求
- Windows 11 或 Windows 10 版本 2004+
- WSL2 with Linux kernel 5.10+
- QEMU 7.0+
- 至少 100GB 磁盤空間

### 安裝步驟

```bash
# 1. 在 WSL2 中安裝必需工具
sudo apt-get update
sudo apt-get install -y qemu-system-x86-64 qemu-efi qemu-utils

# 2. 下載 macOS 鏡像（使用 OpenCore Legacy Patcher）
# 這通常需要來自現有 Mac 的正式 macOS ISO

# 3. 創建虛擬磁盤
qemu-img create -f qcow2 macos-disk.qcow2 100G

# 4. 啟動虛擬機
qemu-system-x86_64 \
  -m 8G \
  -smp 4 \
  -cpu Penryn,kvm=off \
  -drive file=macos-disk.qcow2,format=qcow2 \
  -cdrom macOS.iso \
  -nographic
```

⚠️ **注意**: 這種方法通常性能較差，不推薦用於開發。

---

## 方法 3：Parallels Desktop / VMware Fusion

如果你已經購買了虛擬化軟體：

### Parallels Desktop on Windows (via Boot Camp)

```bash
# 1. 在 Parallels Desktop 中建立虛擬機
# 建議配置:
#   - vCPU: 8+
#   - RAM: 16GB+
#   - Storage: 100GB+
#   - Network: Bridged

# 2. 安裝 macOS
# 使用官方 macOS 安裝程序或恢復鏡像

# 3. 配置開發環境
brew install xcode-command-line-tools
brew install node@20
brew install git

# 4. 安裝 Xcode (可選，用於 iOS 開發)
xcode-select --install
# 或從 App Store 下載完整 Xcode

# 5. 設置構建環境
cd /path/to/remoteai-guardian
npm install
```

---

## 方法 4：雲端 macOS 服務

### MacStadium (推薦用於 CI/CD)

```bash
# 1. 註冊 MacStadium 帳號
# https://www.macstadium.com

# 2. 選擇計劃 (按小時計費，起價 ~$1/小時)

# 3. 連接到你的遠程 Mac
ssh user@your-macstadium-ip

# 4. 設置環境
./setup-macos-build-environment.sh

# 5. 構建應用
cd remoteai-guardian
npm install
npm run build:all
```

### GitHub Actions (免費替代方案)

```yaml
# 最簡單的方法 - 利用 GitHub 免費的 macOS runner
- runs-on: macos-latest  # 免費用於公開倉庫
```

---

## 本地 macOS 構建環境設置

即使你無法在 Windows 上運行 macOS，你也可以：

### 1. 遠程開發
```bash
# 在 Windows 上編輯，通過 SSH 部署到 Mac
ssh -R 3000:localhost:3000 user@your-mac.local "cd ~/project && npm start"
```

### 2. Docker (用於某些構建)
```bash
# 構建 Linux 相容的應用
docker run -it node:20 bash
cd /workspace
npm install
npm run build
```

### 3. GitHub Actions (完全自動化)
```yaml
# 不需要本地 Mac，自動構建
name: Automated Build
on: [push]
jobs:
  build:
    runs-on: macos-latest  # GitHub 提供免費 macOS 環境
```

---

## 推薦方案對比

| 方案 | 成本 | 難度 | 合法性 | 推薦度 |
|------|------|------|--------|--------|
| GitHub Actions | 免費 | ⭐ | ✅ 完全合法 | ⭐⭐⭐⭐⭐ |
| MacStadium | ~$1/h | ⭐⭐ | ✅ 合法 | ⭐⭐⭐⭐ |
| Mac mini | $600+ | ⭐⭐⭐ | ✅ 合法 | ⭐⭐⭐ |
| KVM/QEMU | 免費 | ⭐⭐⭐⭐ | ⚠️ 灰色 | ⭐⭐ |
| 虛擬機軟體 | $80+ | ⭐⭐ | ⚠️ 灰色 | ⭐ |

---

## 下一步

根據你的需求選擇方案：

1. **開源項目 + 自動化構建?**
   → 使用 GitHub Actions (推薦)

2. **需要本地開發環境?**
   → 購買 Mac mini 或使用 MacStadium

3. **只需偶爾構建?**
   → GitHub Actions 或雲端服務

4. **已有 Mac 硬體?**
   → 設置本地開發環境

---

**重要提醒**: 優先考慮合法和官方支援的方案。GitHub Actions 對於大多數開發者來說是最佳選擇。

需要幫助設置特定方案嗎？
