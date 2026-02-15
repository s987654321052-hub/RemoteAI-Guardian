# RemoteAI Guardian - Heroku 部署腳本（PowerShell）

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RemoteAI Guardian - Heroku 部署" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 檢查 Heroku CLI
$herokuPath = & {
    try { Get-Command heroku -ErrorAction Stop }
    catch { $null }
}

if (-not $herokuPath) {
    Write-Host "❌ Heroku CLI 未找到" -ForegroundColor Red
    Write-Host "已為你安裝。請重新運行此腳本。" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Heroku CLI 已檢測到" -ForegroundColor Green
Write-Host ""

# 檢查登入
Write-Host "🔐 檢查 Heroku 登入..."
$auth = & heroku auth:whoami 2>$null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️ 需要登入 Heroku" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "按任意鍵打開登入頁面..." -ForegroundColor Yellow
    Read-Host

    & heroku login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 登入失敗" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ 已登入 Heroku ($auth)" -ForegroundColor Green
Write-Host ""

# 應用名稱
Write-Host "📝 輸入應用名稱（例：remoteai-guardian-2026）："
$appName = Read-Host "應用名稱"

if ([string]::IsNullOrEmpty($appName)) {
    Write-Host "❌ 應用名稱不能為空" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔨 創建 Heroku 應用: $appName..." -ForegroundColor Yellow

& heroku create $appName

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 應用創建失敗（可能名稱已被使用）" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 應用已創建" -ForegroundColor Green
Write-Host ""

# 設置環境變量
Write-Host "⚙️ 設置環境變量..." -ForegroundColor Yellow

$configs = @{
    "LINE_CHANNEL_ID" = "2009132426"
    "LINE_CHANNEL_SECRET" = "8ec86e5781c1e3df454caf94eafb235c"
    "LINE_ACCESS_TOKEN" = "tSq0UBIOGW03sqQjsl1uXJ3VEb5Iukm4CWZl5xb/yVtgRX4yrCRw5xVyyoDQNLUvlMPgOLHVaQq2fhkFCsRPrbDo9lBoFczlEef7uRk+Skf6pKjmPYOQ9IBE71BSyUUdmlEAO9HwvLIdPlllGvNSgdB04t89/1O/w1cDnyilFU="
    "LINE_USER_ID" = "Uee2657aac9ffdc9d6d63f7e5097c0bbc"
}

foreach ($key in $configs.Keys) {
    Write-Host "  設置 $key..." -ForegroundColor Gray
    & heroku config:set "$key=$($configs[$key])" --app=$appName
}

Write-Host "✅ 環境變量已設置" -ForegroundColor Green
Write-Host ""

# 初始化 Git
Write-Host "📦 準備 Git 倉庫..." -ForegroundColor Yellow

cd C:\RemoteAI-Guardian

if (-not (Test-Path ".git")) {
    Write-Host "  初始化 Git..." -ForegroundColor Gray
    & git init
    & git add .
    & git commit -m "Initial RemoteAI Guardian deployment"
}

Write-Host "✅ Git 倉庫已準備" -ForegroundColor Green
Write-Host ""

# 部署到 Heroku
Write-Host "🚀 部署到 Heroku..." -ForegroundColor Yellow
Write-Host "  這可能需要 1-2 分鐘..." -ForegroundColor Gray
Write-Host ""

& heroku git:remote -a $appName
& git push heroku main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ 部署成功！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    $webhookUrl = "https://$appName.herokuapp.com/webhook/line"
    
    Write-Host "📍 Webhook URL:" -ForegroundColor Cyan
    Write-Host "   $webhookUrl" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "📱 接下來的步驟:" -ForegroundColor Cyan
    Write-Host "  1. 進入 LINE Developers Console" -ForegroundColor White
    Write-Host "  2. Messaging API → Webhook settings" -ForegroundColor White
    Write-Host "  3. 填入上面的 Webhook URL" -ForegroundColor White
    Write-Host "  4. 點擊 Save 和 Verify" -ForegroundColor White
    Write-Host "  5. 在手機 LINE 上試試 'ping' 命令" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🧪 查看日誌:" -ForegroundColor Cyan
    Write-Host "   heroku logs --tail --app=$appName" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "🎉 部署完成！" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ 部署失敗" -ForegroundColor Red
    exit 1
}

Write-Host ""
Read-Host "按 Enter 鍵結束"
