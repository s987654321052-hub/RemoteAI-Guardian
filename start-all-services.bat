@echo off
REM RemoteAI Guardian - 完整系統啟動腳本
REM 同時啟動認證系統、儀表板和 LINE 命令處理器

setlocal enabledelayedexpansion

cd /d "%~dp0auth-system"

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     🚀 RemoteAI Guardian - 系統啟動                    ║
echo ║     版本: 1.0.0 (iPhone + LINE 完全整合)               ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM 檢查 Node.js 是否已安裝
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 錯誤: 未偵測到 Node.js
    echo 請前往 https://nodejs.org/ 安裝 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 已檢測到
node --version

REM 檢查依賴是否已安裝
if not exist "node_modules" (
    echo.
    echo 📦 安裝 npm 依賴...
    call npm install
    if errorlevel 1 (
        echo ❌ npm install 失敗
        pause
        exit /b 1
    )
)

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     正在啟動所有服務...                                ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM 建立日誌目錄
if not exist "..\logs" mkdir ..\logs

REM 啟動認證系統（主進程）
echo 🚀 正在啟動認證系統（端口 8888, 9999）...
start "RemoteAI Guardian - Auth System" cmd /k "title RemoteAI Guardian - Auth System && npm start"
timeout /t 3 /nobreak

REM 啟動 LINE 命令處理器
echo 🚀 正在啟動 LINE 命令處理器（端口 3001）...
start "RemoteAI Guardian - LINE Handler" cmd /k "title RemoteAI Guardian - LINE Handler && node line-command-handler.js"
timeout /t 2 /nobreak

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║     ✅ 所有服務已啟動！                               ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo 📱 服務訪問地址:
echo   • 認證系統:    http://localhost:8888
echo   • 儀表板:      http://localhost:9999
echo   • LINE Webhook: http://localhost:3001/webhook/line
echo.
echo 🔗 使用 Tailscale 在 iPhone 上訪問:
echo   • 儀表板: http://%TAILSCALE_IP%:9999
echo.
echo 💡 快速測試:
echo   • 打開 http://localhost:9999 在瀏覽器中查看儀表板
echo   • 在 LINE 上傳送 "help" 查看可用命令
echo   • 在 iPhone Safari 中訪問 http://%TAILSCALE_IP%:9999
echo.
echo 📖 更多幫助請查看: IPHONE_LINE_SETUP.md
echo.
echo ⏳ 按任意鍵退出此視窗...
pause >nul

REM 清理和終止所有相關進程
echo.
echo 正在停止所有服務...
taskkill /F /FI "WINDOWTITLE eq RemoteAI*" 2>nul
echo ✅ 已停止所有服務
