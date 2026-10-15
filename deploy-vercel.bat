@echo off
title EnviroMET CMS - deploy to Vercel
cd /d "%~dp0"
echo Installing packages (first run only)...
call npm install --no-audit --no-fund >> deploy-install.log 2>&1
if errorlevel 1 (
  echo npm install failed - see deploy-install.log
  pause
  exit /b 1
)
node scripts\deploy-vercel.mjs %*
echo.
pause
