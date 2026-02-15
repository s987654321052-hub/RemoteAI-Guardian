@echo off
REM RemoteAI Guardian - 環境設置

REM Python 路徑
set PYTHON_PATH=C:\Users\user\AppData\Local\Programs\Python\Python312
set PATH=%PYTHON_PATH%;%PYTHON_PATH%\Scripts;%PATH%

REM 驗證安裝
echo 驗證安裝環境...
%PYTHON_PATH%\python.exe --version
node --version
npm --version

echo.
echo ✅ 環境設置完成！
echo.
echo 可用命令:
echo   python   - Python 3.12.9
echo   node     - Node.js
echo   npm      - NPM 包管理器
echo.
pause
