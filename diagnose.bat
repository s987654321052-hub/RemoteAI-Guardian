@echo off
REM 診斷 Node.js 安裝

echo.
echo ╔════════════════════════════════════╗
echo ║ 🔍 Node.js 診斷工具
echo ╚════════════════════════════════════╝
echo.

echo 1️⃣ 檢查 Node.js 是否可用...
where node >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js 已找到
    echo.
    node --version
    echo.
) else (
    echo ❌ Node.js 未找到
    echo.
    echo 💡 解決方案:
    echo    1. 下載 Node.js LTS: https://nodejs.org/
    echo    2. 運行安裝程序 (使用默認設置)
    echo    3. 重新啟動命令提示符或 PowerShell
    echo    4. 再次運行此診斷
    echo.
    pause
    exit /b 1
)

echo 2️⃣ 檢查 npm 是否可用...
where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ npm 已找到
    echo.
    npm --version
    echo.
) else (
    echo ❌ npm 未找到
    echo.
)

echo 3️⃣ 檢查項目依賴...
if exist "auth-system\node_modules" (
    echo ✅ node_modules 已存在
    echo.
) else (
    echo ⚠️ node_modules 不存在
    echo 執行此命令安裝依賴:
    echo    cd auth-system
    echo    npm install
    echo.
)

echo 4️⃣ 檢查 auth-system.js 文件...
if exist "auth-system\auth-system.js" (
    echo ✅ auth-system.js 已找到
    echo.
) else (
    echo ❌ auth-system.js 未找到
    echo.
)

echo ✅ 診斷完成!
echo.
echo 準備啟動? 執行:
echo    start.bat
echo.
pause
