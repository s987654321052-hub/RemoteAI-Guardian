@echo off
REM RemoteAI Guardian 啟動腳本
REM 檢查 Node.js 是否已安裝
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo ❌ 錯誤: 找不到 Node.js
    echo.
    echo 請安裝 Node.js LTS 版本: https://nodejs.org/
    echo 安裝完成後，重新啟動此腳本。
    echo.
    pause
    exit /b 1
)

echo.
echo ╔════════════════════════════════════╗
echo ║ 🚀 RemoteAI Guardian 啟動
echo ╚════════════════════════════════════╝
echo.

REM 切換到項目目錄
cd /d "%~dp0"

REM 確保依賴已安裝
echo 📦 檢查依賴...
if not exist "auth-system\node_modules" (
    echo 安裝 npm 依賴...
    cd auth-system
    call npm install
    cd ..
)

echo.
echo ✅ 所有依賴已就緒
echo.
echo 啟動服務...
echo.

REM 啟動認證系統
echo 🔐 啟動認證系統 (端口 8888)...
start "Auth System" cmd /k "cd /d %~dp0auth-system && node auth-system.js"
timeout /t 2 /nobreak

REM 啟動 Webhook
echo 📨 啟動 Webhook (端口 3001)...
start "Webhook" cmd /k "cd /d %~dp0auth-system && node line-webhook-simple.js"
timeout /t 2 /nobreak

echo.
echo ╔════════════════════════════════════╗
echo ║ ✅ 所有服務已啟動
echo ╚════════════════════════════════════╝
echo.
echo 📍 訪問地址:
echo    • 儀表板: http://localhost:9999
echo    • API: http://localhost:8888
echo    • Webhook: http://localhost:3001
echo.
echo 💡 試試這個命令:
echo    cd auth-system
echo    node test-webhook-local.js ping
echo.
echo 按任意鍵關閉此窗口...
pause
