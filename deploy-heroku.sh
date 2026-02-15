#!/bin/bash

# RemoteAI Guardian - Heroku 自動部署腳本

echo "🚀 RemoteAI Guardian - Heroku 部署開始"
echo ""

# 檢查 Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI 未安裝"
    echo "運行: npm install -g heroku"
    exit 1
fi

echo "✅ Heroku CLI 已檢測到"
echo ""

# 檢查 Git
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安裝"
    exit 1
fi

echo "✅ Git 已檢測到"
echo ""

# 檢查登入
echo "🔐 檢查 Heroku 登入狀態..."
if ! heroku auth:whoami &> /dev/null; then
    echo "⚠️ 未登入 Heroku，現在登入..."
    heroku login
fi

echo "✅ Heroku 登入成功"
echo ""

# 應用名稱
read -p "📝 輸入應用名稱 (例: remoteai-guardian-2026): " APP_NAME

if [ -z "$APP_NAME" ]; then
    echo "❌ 應用名稱不能為空"
    exit 1
fi

echo ""
echo "🔨 創建 Heroku 應用: $APP_NAME..."
heroku create $APP_NAME

if [ $? -ne 0 ]; then
    echo "❌ 應用創建失敗，可能名稱已被使用"
    exit 1
fi

echo "✅ 應用已創建"
echo ""

# 設置環境變量
echo "⚙️ 設置環境變量..."
heroku config:set LINE_CHANNEL_ID=2009132426 --app=$APP_NAME
heroku config:set LINE_CHANNEL_SECRET=8ec86e5781c1e3df454caf94eafb235c --app=$APP_NAME
heroku config:set LINE_ACCESS_TOKEN=tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU= --app=$APP_NAME
heroku config:set LINE_USER_ID=Uee2657aac9ffdc9d6d63f7e5097c0bbc --app=$APP_NAME

echo "✅ 環境變量已設置"
echo ""

# 初始化 Git
echo "📦 準備 Git 倉庫..."
if [ ! -d ".git" ]; then
    git init
    git add .
    git commit -m "Initial RemoteAI Guardian deployment"
fi

echo "✅ Git 倉庫已準備"
echo ""

# 部署到 Heroku
echo "🚀 部署到 Heroku..."
heroku git:remote -a $APP_NAME
git push heroku main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 部署成功！"
    echo ""
    echo "📍 Webhook URL:"
    echo "   https://${APP_NAME}.herokuapp.com/webhook/line"
    echo ""
    echo "📱 在 LINE Developers Console 中設置此 Webhook URL"
    echo ""
    echo "🧪 查看日誌："
    echo "   heroku logs --tail --app=$APP_NAME"
    echo ""
    echo "🎉 現在在手機 LINE 上試試 'ping' 命令吧！"
else
    echo "❌ 部署失敗"
    exit 1
fi
