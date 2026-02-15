#!/bin/bash

# RemoteAI Guardian - 完整部署檢查清單
# 用於驗證所有組件已正確安裝和配置

echo "╔════════════════════════════════════════════════════════╗"
echo "║     RemoteAI Guardian - 部署檢查清單                  ║"
echo "║     版本: 1.0.0 (iPhone + LINE 完全整合)               ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# 顏色定義
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_count=0
pass_count=0

# 檢查函數
check() {
    local name=$1
    local command=$2
    check_count=$((check_count + 1))
    
    if eval $command > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $name"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "${RED}❌${NC} $name"
        return 1
    fi
}

# 系統檢查
echo "📋 系統檢查"
echo "─────────────────────────────────────────────────────────"

check "Node.js 已安裝" "node --version"
check "npm 已安裝" "npm --version"
check "git 已安裝" "git --version"

echo ""

# 項目文件檢查
echo "📁 項目文件檢查"
echo "─────────────────────────────────────────────────────────"

cd "$(dirname "$0")" || exit

check ".env 文件存在" "test -f .env"
check "認證系統存在" "test -f auth-system/auth-system.js"
check "儀表板存在" "test -f auth-system/iphone-dashboard.js"
check "LINE 處理器存在" "test -f auth-system/line-command-handler.js"
check "iOS 應用存在" "test -f iOS/RemoteAIGuardianApp.swift"
check "package.json 存在" "test -f auth-system/package.json"

echo ""

# 依賴檢查
echo "📦 依賴檢查"
echo "─────────────────────────────────────────────────────────"

check "node_modules 目錄存在" "test -d auth-system/node_modules"

if test -d auth-system/node_modules; then
    check "Express 已安裝" "test -d auth-system/node_modules/express"
    check "Axios 已安裝" "test -d auth-system/node_modules/axios"
    check "dotenv 已安裝" "test -d auth-system/node_modules/dotenv"
fi

echo ""

# 環境變數檢查
echo "🔐 環境變數檢查"
echo "─────────────────────────────────────────────────────────"

# 加載 .env 文件
if test -f .env; then
    source .env 2>/dev/null || true
fi

if [ -n "$LINE_CHANNEL_ID" ]; then
    echo -e "${GREEN}✅${NC} LINE_CHANNEL_ID 已設置"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}❌${NC} LINE_CHANNEL_ID 未設置"
fi
check_count=$((check_count + 1))

if [ -n "$LINE_CHANNEL_SECRET" ]; then
    echo -e "${GREEN}✅${NC} LINE_CHANNEL_SECRET 已設置"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}❌${NC} LINE_CHANNEL_SECRET 未設置"
fi
check_count=$((check_count + 1))

if [ -n "$LINE_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅${NC} LINE_ACCESS_TOKEN 已設置"
    pass_count=$((pass_count + 1))
else
    echo -e "${RED}❌${NC} LINE_ACCESS_TOKEN 未設置"
fi
check_count=$((check_count + 1))

if [ -n "$LINE_USER_ID" ]; then
    echo -e "${GREEN}✅${NC} LINE_USER_ID 已設置"
    pass_count=$((pass_count + 1))
else
    echo -e "${YELLOW}⚠️${NC}  LINE_USER_ID 未設置（可從 LINE Webhook 自動提取）"
fi
check_count=$((check_count + 1))

echo ""

# Tailscale 檢查
echo "🔗 Tailscale 檢查"
echo "─────────────────────────────────────────────────────────"

if [ -n "$TAILSCALE_IP" ]; then
    echo -e "${GREEN}✅${NC} TAILSCALE_IP 已配置: $TAILSCALE_IP"
    pass_count=$((pass_count + 1))
else
    echo -e "${YELLOW}⚠️${NC}  TAILSCALE_IP 未配置"
fi
check_count=$((check_count + 1))

echo ""

# 文檔檢查
echo "📚 文檔檢查"
echo "─────────────────────────────────────────────────────────"

check "快速開始指南" "test -f QUICKSTART.md"
check "iPhone 設置指南" "test -f IPHONE_LINE_SETUP.md"
check "快速參考" "test -f QUICK_REFERENCE.md"

echo ""

# 執行腳本檢查
echo "🎯 執行腳本檢查"
echo "─────────────────────────────────────────────────────────"

check "啟動所有服務腳本" "test -f start-all-services.bat"

echo ""

# 測試端口
echo "🔌 端口檢查"
echo "─────────────────────────────────────────────────────────"

check "端口 8888 未被占用" "! lsof -i :8888 2>/dev/null | grep -q LISTEN"
check "端口 9999 未被占用" "! lsof -i :9999 2>/dev/null | grep -q LISTEN"
check "端口 3001 未被占用" "! lsof -i :3001 2>/dev/null | grep -q LISTEN"

echo ""

# 最終報告
echo "╔════════════════════════════════════════════════════════╗"
echo "║           📊 部署檢查結果                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "通過: $pass_count / $check_count 檢查"

if [ $pass_count -eq $check_count ]; then
    echo -e "${GREEN}✅ 所有檢查均已通過！系統已準備好部署。${NC}"
    exit 0
elif [ $pass_count -ge $((check_count * 80 / 100)) ]; then
    echo -e "${YELLOW}⚠️  大部分檢查已通過，但某些配置需要完成。${NC}"
    exit 1
else
    echo -e "${RED}❌ 多個檢查失敗，請查看上述錯誤。${NC}"
    exit 2
fi
