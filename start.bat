@echo off
cd /d "%~dp0"
echo Adventure Journal - Starting server...
echo.
echo The app will open in your browser.
echo Keep this window open while using the app. Close it to stop the server.
echo.
node backend/server.js
