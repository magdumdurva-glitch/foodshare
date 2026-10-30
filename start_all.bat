@echo off
echo ========================================================
echo       Starting FoodShare WMD Platform
echo ========================================================
echo.
echo [1/2] Launching Kotlin REST API on http://localhost:5000 ...
start "FoodShare Backend API" cmd /k "cd /d %~dp0server && start_server.bat"

echo [2/2] Launching React + Vite Frontend on http://localhost:5173 ...
start "FoodShare Web Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo Waiting for services to initialize...
ping 127.0.0.1 -n 4 >nul

echo Opening FoodShare in your browser...
start http://localhost:5173

echo.
echo FoodShare is now running at http://localhost:5173! Keep the terminal windows open while testing.
