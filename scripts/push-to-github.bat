@echo off
rem One-time helper: pushes the TKPL project to GitHub in a visible window
rem so the GitHub sign-in prompt can appear. Safe to delete afterwards.
cd /d "%~dp0.."
echo Pushing TKPL to https://github.com/r73608925-lab/TKPL.git
echo If asked, sign in as r73608925-lab. For a password, paste a GitHub access token.
echo.
git push -u origin main
echo.
pause
