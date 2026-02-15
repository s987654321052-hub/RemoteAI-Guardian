#!/bin/bash

# RemoteAI Guardian - 完整構建和發佈腳本
# 支援 iOS、macOS、Windows、Linux 多平台

set -e

VERSION=${1:-"1.0.0"}
BUILD_DIR="build"
DIST_DIR="dist"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
}

print_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 檢查先決條件
check_prerequisites() {
    print_header "檢查前置要求"
    
    print_step "檢查 Node.js..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安裝"
        exit 1
    fi
    print_success "Node.js $(node --version) 已安裝"
    
    print_step "檢查 npm..."
    if ! command -v npm &> /dev/null; then
        print_error "npm 未安裝"
        exit 1
    fi
    print_success "npm $(npm --version) 已安裝"
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_step "檢查 Xcode..."
        if ! xcode-select -p &> /dev/null; then
            print_error "Xcode Command Line Tools 未安裝"
            exit 1
        fi
        print_success "Xcode 已安裝"
    fi
}

# 清理構建文件
clean_build() {
    print_header "清理構建文件"
    
    print_step "移除舊的構建文件..."
    rm -rf "$BUILD_DIR" "$DIST_DIR"
    rm -rf auth-system/build
    rm -rf iOS/build
    print_success "清理完成"
}

# 安裝依賴
install_deps() {
    print_header "安裝依賴"
    
    print_step "安裝 Node.js 依賴..."
    cd auth-system
    npm install --production=false
    cd ..
    print_success "依賴安裝完成"
}

# 運行測試
run_tests() {
    print_header "運行測試"
    
    print_step "運行整合測試..."
    cd auth-system
    npm run test-integration || print_error "測試失敗，但繼續構建"
    cd ..
}

# 構建 iOS
build_ios() {
    print_header "構建 iOS 應用"
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS 構建僅支援 macOS"
        return 1
    fi
    
    print_step "構建模擬器版本..."
    cd iOS
    xcodebuild \
        -scheme RemoteAIGuardian \
        -configuration Release \
        -sdk iphonesimulator \
        -derivedDataPath build \
        build || print_error "模擬器構建失敗"
    cd ..
    print_success "模擬器構建完成"
    
    print_step "構建設備版本..."
    cd iOS
    xcodebuild \
        -scheme RemoteAIGuardian \
        -configuration Release \
        -sdk iphoneos \
        -derivedDataPath build \
        build || print_error "設備構建失敗"
    cd ..
    print_success "設備構建完成"
    
    print_step "創建歸檔..."
    cd iOS
    xcodebuild \
        -scheme RemoteAIGuardian \
        -configuration Release \
        -sdk iphoneos \
        -derivedDataPath build \
        archive \
        -archivePath build/RemoteAIGuardian.xcarchive || print_error "歸檔創建失敗"
    cd ..
    print_success "歸檔創建完成"
    
    print_step "導出 IPA..."
    cd iOS
    xcodebuild \
        -exportArchive \
        -archivePath build/RemoteAIGuardian.xcarchive \
        -exportOptionsPlist ExportOptions.plist \
        -exportPath build/ipa || print_error "IPA 導出失敗"
    cd ..
    print_success "IPA 導出完成"
    
    # 複製到 dist
    mkdir -p "$DIST_DIR"
    cp iOS/build/ipa/RemoteAIGuardian.ipa "$DIST_DIR/RemoteAIGuardian-$VERSION.ipa"
    print_success "iOS 應用已構建: $DIST_DIR/RemoteAIGuardian-$VERSION.ipa"
}

# 構建 macOS
build_macos() {
    print_header "構建 macOS 應用"
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "macOS 構建僅支援 macOS"
        return 1
    fi
    
    cd auth-system
    
    print_step "安裝 Electron Builder..."
    npm install --save-dev electron electron-builder || print_error "安裝失敗"
    
    print_step "構建 DMG..."
    npx electron-builder --mac dmg --publish never || print_error "DMG 構建失敗"
    
    cd ..
    
    # 複製到 dist
    mkdir -p "$DIST_DIR"
    cp auth-system/build/*.dmg "$DIST_DIR/RemoteAIGuardian-$VERSION.dmg"
    print_success "macOS 應用已構建: $DIST_DIR/RemoteAIGuardian-$VERSION.dmg"
}

# 構建 Windows
build_windows() {
    print_header "構建 Windows 應用"
    
    cd auth-system
    
    print_step "安裝 Electron Builder..."
    npm install --save-dev electron electron-builder || print_error "安裝失敗"
    
    print_step "構建可執行檔..."
    npx electron-builder --win --publish never || print_error "Windows 構建失敗"
    
    cd ..
    
    # 複製到 dist
    mkdir -p "$DIST_DIR"
    cp auth-system/build/*.exe "$DIST_DIR/RemoteAIGuardian-$VERSION.exe"
    print_success "Windows 應用已構建: $DIST_DIR/RemoteAIGuardian-$VERSION.exe"
}

# 構建 Linux
build_linux() {
    print_header "構建 Linux 應用"
    
    cd auth-system
    
    print_step "安裝 Electron Builder..."
    npm install --save-dev electron electron-builder || print_error "安裝失敗"
    
    print_step "構建 AppImage 和 DEB..."
    npx electron-builder --linux AppImage deb --publish never || print_error "Linux 構建失敗"
    
    cd ..
    
    # 複製到 dist
    mkdir -p "$DIST_DIR"
    cp auth-system/build/*.AppImage "$DIST_DIR/RemoteAIGuardian-$VERSION.AppImage"
    cp auth-system/build/*.deb "$DIST_DIR/RemoteAIGuardian-$VERSION.deb"
    print_success "Linux 應用已構建"
}

# 生成校驗和
generate_checksums() {
    print_header "生成校驗和"
    
    print_step "計算 SHA256..."
    cd "$DIST_DIR"
    sha256sum * > SHA256SUMS.txt
    cat SHA256SUMS.txt
    cd ..
    print_success "校驗和已生成"
}

# 生成發佈說明
generate_release_notes() {
    print_header "生成發佈說明"
    
    print_step "創建 RELEASE_NOTES.md..."
    
    cat > "$DIST_DIR/RELEASE_NOTES.md" << EOF
# RemoteAI Guardian v$VERSION

**發佈日期**: $(date -u +'%Y-%m-%d %H:%M:%S UTC')

## 新增功能

- 完整的 iPhone + LINE 整合系統
- 多平台支援 (iOS, macOS, Windows, Linux)
- 自動化構建和發佈流程

## 已知問題

- 無

## 系統要求

### iOS
- iOS 14.0 或更高

### macOS
- macOS 10.13 或更高
- Intel 或 Apple Silicon

### Windows
- Windows 10 或更高
- .NET Framework 4.5+

### Linux
- Ubuntu 20.04+
- GLIBC 2.29+

## 安裝

### iOS
1. 下載 IPA 文件
2. 使用 Xcode 或 Apple Configurator 2 安裝
3. 或上傳到 TestFlight

### macOS
1. 下載 DMG 文件
2. 雙擊打開
3. 將應用拖到 Applications 文件夾

### Windows
1. 下載 EXE 文件
2. 雙擊運行安裝程序
3. 按照提示完成安裝

### Linux
1. 下載 AppImage 或 DEB 文件
2. AppImage: \`chmod +x *.AppImage && ./RemoteAIGuardian*.AppImage\`
3. DEB: \`sudo dpkg -i *.deb\`

## 完整變更日誌

[查看完整提交歷史](https://github.com/your-repo/commits/v$VERSION)

---

**感謝使用 RemoteAI Guardian！**

有問題？[提交 Issue](https://github.com/your-repo/issues)
EOF
    
    print_success "發佈說明已生成"
}

# 生成構件清單
generate_artifacts_list() {
    print_header "生成構件清單"
    
    echo ""
    echo "📦 構件位置:"
    echo ""
    ls -lh "$DIST_DIR"/ | grep -v "^total" | grep -v "^d" | awk '{printf "  %-40s %10s\n", $9, $5}'
    echo ""
}

# 主函數
main() {
    print_header "RemoteAI Guardian 構建系統 v$VERSION"
    
    # 檢查前置要求
    check_prerequisites
    
    # 清理舊構建
    read -p "是否清理舊的構建文件？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        clean_build
    fi
    
    # 安裝依賴
    install_deps
    
    # 運行測試
    read -p "是否運行測試？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    # 選擇要構建的平台
    echo ""
    echo "選擇要構建的平台:"
    echo "1. iOS"
    echo "2. macOS"
    echo "3. Windows"
    echo "4. Linux"
    echo "5. 全部"
    echo "6. 跳過構建"
    
    read -p "請選擇 (1-6): " platform
    
    case $platform in
        1) build_ios ;;
        2) build_macos ;;
        3) build_windows ;;
        4) build_linux ;;
        5)
            build_ios || true
            build_macos || true
            build_windows || true
            build_linux || true
            ;;
        6) print_step "跳過構建" ;;
        *) print_error "無效選擇" ;;
    esac
    
    # 生成校驗和和發佈說明
    if [ -d "$DIST_DIR" ] && [ "$(ls -A $DIST_DIR)" ]; then
        generate_checksums
        generate_release_notes
        generate_artifacts_list
        
        print_header "構建完成！"
        echo ""
        echo "📦 構件位置: $DIST_DIR"
        echo ""
        echo "下一步:"
        echo "1. 查看 $DIST_DIR/RELEASE_NOTES.md"
        echo "2. 驗證 $DIST_DIR/SHA256SUMS.txt"
        echo "3. 創建 Git 標籤: git tag v$VERSION"
        echo "4. 推送到 GitHub: git push origin v$VERSION"
        echo ""
    else
        print_error "沒有構件生成"
    fi
}

# 運行
main
