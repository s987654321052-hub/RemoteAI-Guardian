#!/bin/bash

# GitHub Actions 快速設置腳本
# 自動化配置 GitHub Actions 工作流

set -e

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 檢查先決條件
check_prerequisites() {
    print_header "檢查先決條件"
    
    print_step "檢查 Git..."
    if ! command -v git &> /dev/null; then
        print_error "Git 未安裝"
        exit 1
    fi
    print_success "Git 已安裝 ($(git --version))"
    
    print_step "檢查 GitHub CLI..."
    if ! command -v gh &> /dev/null; then
        print_info "GitHub CLI 未安裝，請訪問 https://cli.github.com 安裝"
        read -p "已安裝 GitHub CLI？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        print_success "GitHub CLI 已安裝"
    fi
    
    print_step "檢查 GitHub 登錄..."
    if ! gh auth status &> /dev/null; then
        print_error "未登錄 GitHub，請運行 'gh auth login'"
        gh auth login || exit 1
    fi
    print_success "已登錄 GitHub"
}

# 初始化 Git 倉庫
init_git_repo() {
    print_header "初始化 Git 倉庫"
    
    if [ -d .git ]; then
        print_step "Git 倉庫已存在"
        git status
        return
    fi
    
    print_step "初始化 Git..."
    git init
    git config user.email "$(git config --global user.email || echo 'you@example.com')"
    git config user.name "$(git config --global user.name || echo 'Your Name')"
    
    print_step "添加所有文件..."
    git add .
    
    print_step "首次提交..."
    git commit -m "Initial commit: RemoteAI Guardian v1.0.0"
    
    print_success "Git 倉庫已初始化"
}

# 創建 GitHub 倉庫
create_github_repo() {
    print_header "創建 GitHub 倉庫"
    
    read -p "GitHub 用戶名: " username
    read -p "倉庫名稱 (默認: RemoteAI-Guardian): " repo_name
    repo_name=${repo_name:-RemoteAI-Guardian}
    
    print_step "檢查倉庫是否已存在..."
    if gh repo view "$username/$repo_name" &> /dev/null; then
        print_error "倉庫已存在"
        exit 1
    fi
    
    print_step "創建新倉庫..."
    gh repo create "$repo_name" \
        --public \
        --source=. \
        --remote=origin \
        --push \
        --description "AI-powered remote execution system with iPhone + LINE integration" \
        || print_error "創建倉庫失敗"
    
    print_success "倉庫已創建: https://github.com/$username/$repo_name"
}

# 配置 Secrets
setup_secrets() {
    print_header "配置 GitHub Secrets"
    
    print_info "將在 GitHub 網頁上配置 Secrets"
    echo ""
    echo "需要配置的 Secrets:"
    echo ""
    echo "基礎配置 (可選):"
    echo "  • NODE_VERSION = 20"
    echo "  • XCODE_VERSION = latest"
    echo ""
    echo "iOS 構建 (可選):"
    echo "  • APPLE_ID = your-apple-id@example.com"
    echo "  • APPLE_ID_PASSWORD = your-app-specific-password"
    echo "  • ASC_PROVIDER = your-team-id"
    echo ""
    echo "macOS 簽名 (可選):"
    echo "  • MAC_CERTIFICATE = (base64 encoded .p12)"
    echo "  • MAC_CERTIFICATE_PWD = certificate-password"
    echo ""
    echo "Windows 簽名 (可選):"
    echo "  • WIN_CSC_LINK = (base64 encoded .pfx)"
    echo "  • WIN_CSC_KEY_PASSWORD = certificate-password"
    echo ""
    echo "通知 (可選):"
    echo "  • SLACK_WEBHOOK = https://hooks.slack.com/services/..."
    echo ""
    
    read -p "按 Enter 打開 GitHub 設置頁面..."
    open_url
}

open_url() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open "https://github.com/$username/$repo_name/settings/secrets/actions"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open "https://github.com/$username/$repo_name/settings/secrets/actions"
    elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
        start "https://github.com/$username/$repo_name/settings/secrets/actions"
    fi
}

# 驗證工作流
verify_workflows() {
    print_header "驗證工作流文件"
    
    print_step "檢查工作流文件..."
    if [ ! -d .github/workflows ]; then
        print_error "工作流目錄不存在"
        exit 1
    fi
    
    workflows=$(ls -1 .github/workflows/*.yml 2>/dev/null | wc -l)
    if [ "$workflows" -eq 0 ]; then
        print_error "未找到工作流文件"
        exit 1
    fi
    
    print_success "找到 $workflows 個工作流文件:"
    ls -1 .github/workflows/*.yml | sed 's/^/  • /'
    
    # 驗證 YAML 語法
    print_step "驗證 YAML 語法..."
    for file in .github/workflows/*.yml; do
        if command -v yamllint &> /dev/null; then
            if yamllint "$file" > /dev/null 2>&1; then
                print_success "$(basename $file) - 語法正確"
            else
                print_error "$(basename $file) - 語法錯誤"
                yamllint "$file"
                exit 1
            fi
        else
            print_info "未安裝 yamllint，跳過語法檢查"
        fi
    done
}

# 測試工作流
test_workflows() {
    print_header "測試工作流"
    
    print_step "推送代碼到 GitHub..."
    git push origin main
    
    print_step "等待 GitHub Actions 初始化..."
    sleep 5
    
    print_step "查看工作流列表..."
    gh workflow list --repo "$username/$repo_name"
    
    echo ""
    read -p "是否現在觸發一個工作流測試？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "選擇要觸發的工作流:"
        echo "1. Build macOS App"
        echo "2. Build iOS App"
        echo "3. 手動觸發 (skip)"
        
        read -p "請選擇 (1-3): " choice
        
        case $choice in
            1)
                print_step "觸發 Build macOS App..."
                gh workflow run build-macos-app.yml --repo "$username/$repo_name"
                print_success "工作流已觸發"
                ;;
            2)
                print_step "觸發 Build iOS App..."
                gh workflow run build-ios-app.yml --repo "$username/$repo_name"
                print_success "工作流已觸發"
                ;;
            *)
                print_info "跳過工作流觸發"
                ;;
        esac
    fi
}

# 顯示監控命令
show_monitoring() {
    print_header "監控命令"
    
    echo ""
    echo "查看工作流運行:"
    echo "  gh run list --repo $username/$repo_name"
    echo ""
    echo "查看特定運行的日誌:"
    echo "  gh run view <run-id> --log"
    echo ""
    echo "在瀏覽器中查看:"
    echo "  https://github.com/$username/$repo_name/actions"
    echo ""
}

# 生成快速參考卡
generate_quick_ref() {
    print_header "生成快速參考"
    
    cat > .github/QUICK_REFERENCE.md << 'EOF'
# GitHub Actions 快速參考

## 推送代碼自動構建

```bash
git add .
git commit -m "Your changes"
git push origin main
```

## 創建發佈版本

```bash
# 更新版本
npm version minor

# 創建標籤
git tag v1.1.0

# 推送標籤 (自動觸發完整發佈)
git push origin v1.1.0
```

## 查看運行狀態

```bash
# 列出所有運行
gh run list

# 查看特定運行的日誌
gh run view <run-id> --log

# 在瀏覽器中查看
# https://github.com/YOUR_USERNAME/RemoteAI-Guardian/actions
```

## 下載構件

```bash
# 從 Artifacts 下載
gh run download <run-id> -D ./downloads/

# 從 Releases 下載 (推薦)
# https://github.com/YOUR_USERNAME/RemoteAI-Guardian/releases
```

## 故障排除

### 工作流不觸發
- 檢查工作流文件是否在 .github/workflows/
- 檢查 YAML 語法
- 檢查 Actions 是否已啟用 (Settings → Actions)

### 構建失敗
- 查看詳細日誌
- 檢查 Secrets 配置
- 查看構建時間是否超過限制 (6 小時)

### 簽名失敗
- 檢查 APPLE_ID 和 APPLE_ID_PASSWORD
- 確認證書未過期
- 重新生成 App-Specific Password

## 有用的鏈接

- GitHub Actions 文檔: https://docs.github.com/en/actions
- 工作流語法: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions
- Electron Builder: https://www.electron.build/
EOF
    
    print_success "快速參考已生成: .github/QUICK_REFERENCE.md"
}

# 主菜單
show_main_menu() {
    print_header "GitHub Actions 自動設置"
    
    echo ""
    echo "選擇要執行的操作:"
    echo ""
    echo "1. 完整設置 (推薦)"
    echo "2. 只初始化 Git 倉庫"
    echo "3. 創建 GitHub 倉庫"
    echo "4. 驗證工作流"
    echo "5. 配置 Secrets"
    echo "6. 測試工作流"
    echo "7. 顯示監控命令"
    echo "8. 生成快速參考"
    echo "9. 退出"
    echo ""
    
    read -p "請選擇 (1-9): " choice
    
    case $choice in
        1)
            check_prerequisites
            init_git_repo
            print_step "準備創建 GitHub 倉庫..."
            create_github_repo
            verify_workflows
            setup_secrets
            test_workflows
            show_monitoring
            generate_quick_ref
            print_header "✅ 設置完成！"
            ;;
        2)
            check_prerequisites
            init_git_repo
            ;;
        3)
            check_prerequisites
            create_github_repo
            ;;
        4)
            verify_workflows
            ;;
        5)
            setup_secrets
            ;;
        6)
            check_prerequisites
            test_workflows
            ;;
        7)
            show_monitoring
            ;;
        8)
            generate_quick_ref
            ;;
        9)
            print_info "再見！"
            exit 0
            ;;
        *)
            print_error "無效選擇"
            show_main_menu
            ;;
    esac
}

# 主函數
main() {
    show_main_menu
}

# 運行
main
