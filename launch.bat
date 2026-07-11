@echo off
cd /d "%~dp0"
echo.
echo    Adventures Journal
echo    ==================
echo.
echo Starting, please wait...
echo.

REM 1. Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found.
    echo Please install Node.js from https://nodejs.org
    echo.
    pause
    exit /b 1
)

REM 2. Install dependencies (only if needed)
if not exist "node_modules\express" (
    echo First run -- installing dependencies...
    call npm install
)

REM 3. Start server, then open in Chrome app mode
start "" /B node launch.js

echo App is starting -- a standalone window will open shortly.
echo.
echo To quit the app, just close the window.
