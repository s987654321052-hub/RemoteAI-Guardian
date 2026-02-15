@echo off
REM RemoteAI Guardian - 本地開發啟動腳本
REM 自動啟動認證系統、Webhook 和測試工具

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   RemoteAI Guardian v1.0.0 - 本地啟動
echo ========================================
echo.

REM 檢查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 錯誤: Node.js 未安裝或不在 PATH 中
    echo 請下載安裝: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js 已檢測到

REM 進入專案目錄
cd /d "%~dp0auth-system"

if not exist "package.json" (
    echo ❌ 錯誤: 找不到 package.json
    echo 請確保在 RemoteAI-Guardian 目錄中運行此腳本
    pause
    exit /b 1
)

echo ✅ 項目目錄正確

REM 檢查依賴
if not exist "node_modules" (
    echo 📦 首次運行，安裝依賴...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 依賴安裝失敗
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   啟動服務...
echo ========================================
echo.

REM 啟動認證系統
echo 🚀 啟動認證系統 (8888)...
start "RemoteAI Guardian - 認證系統" cmd /k "npm start"
timeout /t 2 /nobreak

REM 啟動 Webhook
echo 🚀 啟動 Webhook (3001)...
start "RemoteAI Guardian - Webhook" cmd /k "node line-webhook-simple.js"
timeout /t 2 /nobreak

REM 啟動測試工具
echo 🧪 啟動測試工具...
start "RemoteAI Guardian - 測試工具" cmd /k "
echo.
echo ========================================
echo   RemoteAI Guardian - 本地測試工具
echo ========================================
echo.
echo 📍 認證系統: http://localhost:8888
echo 📍 Webhook:   http://localhost:3001/webhook/line
echo.
echo 🧪 快速命令:
echo   node test-webhook-local.js ping
echo   node test-webhook-local.js help
echo   node test-webhook-local.js status
echo   node test-webhook-local.js "run dir"
echo   node test-webhook-local.js "run tasklist"
echo.
echo 📖 完整測試:
echo   node test-webhook-local.js
echo.
echo ========================================
echo.
"
timeout /t 2 /nobreak

echo.
echo ========================================
echo   ✅ 所有服務已啟動！
echo ========================================
echo.
echo 📊 服務地址:
echo   • 認證系統:   http://localhost:8888
echo   • Webhook:    http://localhost:3001/webhook/line
echo   • 測試工具:   在新打開的終端中
echo.
echo 🧪 開始測試:
echo   node test-webhook-local.js ping
echo.
echo 💡 提示:
echo   • 3 個新的終端視窗已打開
echo   • 每個服務在獨立的終端中運行
echo   • 關閉終端可停止對應服務
echo   • 關閉此窗口不會停止其他服務
echo.
echo ========================================
echo.

pause
