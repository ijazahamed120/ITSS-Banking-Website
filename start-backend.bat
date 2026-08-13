@echo off
REM Kill all Node processes
echo Stopping any running Node processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait a moment
timeout /t 2 /nobreak

REM Go to backend folder
cd backend

REM Start the server
echo.
echo Starting Backend Server on http://localhost:3001
echo.
node server.js

pause
