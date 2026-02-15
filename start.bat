@echo off
cd /d "%~dp0auth-system"
echo.
echo Starting RemoteAI Guardian...
echo.
start "Auth System" cmd /k "npm start"
timeout /t 2 /nobreak
start "Webhook" cmd /k "node line-webhook-simple.js"
timeout /t 2 /nobreak
start "Test Tool" cmd /k "echo Ready for testing. Try: node test-webhook-local.js ping"
echo.
echo All services started!
echo.
pause
