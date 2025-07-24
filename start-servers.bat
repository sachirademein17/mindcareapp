@echo off
echo Starting Mental Health Platform...
echo.

echo Starting Backend Server...
start cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers are starting...
echo Frontend will be available at: http://localhost:5173/
echo Backend API will be available at: http://localhost:5000/
echo.
echo Network access URLs (for other devices on your network):
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4"') do (
    set "ip=%%a"
    setlocal enabledelayedexpansion
    set "ip=!ip: =!"
    if not "!ip!"=="" echo   http://!ip!:5173/
    endlocal
)
echo.
pause
