@echo off
echo ========================================================
echo Starting Sami Cafe and Restaurant (Server + Client)
echo ========================================================

start "Sami Cafe - Backend Server (Port 5000)" cmd /k "cd server && npm run dev"
timeout /t 3 >nul
start "Sami Cafe - Frontend Client (Port 5173)" cmd /k "cd client && npm run dev"

echo Both services launched!
echo Server: http://localhost:5000/api/v1
echo Client: http://localhost:5173
echo ========================================================
pause
