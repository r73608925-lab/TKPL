@echo off
title TKPL - Tennisball Kadapa Premier League Portal
cd /d "%~dp0"

echo ============================================================================
echo   TKPL - Tennisball Kadapa Premier League (Player & Organizer Portal)
echo ============================================================================
echo.

if not exist "node_modules" (
    echo [1/2] First-time setup: Installing packages...
    call npm install
)

echo Starting local TKPL portal server and opening your browser...
start "" "http://localhost:5173"
call npm run dev
pause
