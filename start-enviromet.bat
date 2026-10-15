@echo off
title EnviroMET CMS - keep this window open
cd /d "%~dp0"
echo ==================================================
echo   EnviroMET website + Payload CMS
echo ==================================================
where node >nul 2>nul || goto :nonode
node -v > run-status.log
rem Install when packages are missing or new ones were added to package.json
if exist node_modules\@payloadcms\db-postgres\package.json if exist node_modules\@payloadcms\storage-vercel-blob\package.json if exist node_modules\@tailwindcss\postcss\package.json if exist node_modules\.bin\next.cmd goto :start

set TRIES=0
:install
set /a TRIES+=1
echo Installing packages (attempt %TRIES% of 3) - this takes a few minutes...
echo INSTALLING %TRIES% >> run-status.log
call npm install --no-audit --no-fund --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000 > install.log 2>&1
if exist node_modules\@tailwindcss\postcss\package.json goto :start
if %TRIES% LSS 3 (
  echo Network interrupted - retrying...
  timeout /t 5 >nul
  goto :install
)
echo INSTALL_FAILED >> run-status.log
echo.
echo npm install failed 3 times. Check your internet connection / VPN, then run this file again.
echo Details are in install.log
pause
exit /b 1

:start
rem One-time update of the local database: shared sections, solution settings, page templates.
rem Safe: it never deletes content. Delete upgrade.done to run it again.
if exist upgrade.done goto :run
echo Updating the local database (one time, about a minute)...
call npm run upgrade > upgrade.log 2>&1
if errorlevel 1 (
  echo The database update failed - details in upgrade.log. The site still starts.
) else (
  echo done > upgrade.done
)

:run
echo STARTING >> run-status.log
echo.
echo Starting the server... the first page load takes ~30 seconds.
echo.
echo   Website: http://localhost:3000
echo   Arabic:  http://localhost:3000/ar
echo   CMS:     http://localhost:3000/admin
echo.
echo Keep this window open while you use the site. Close it to stop the server.
call npm run dev > dev.log 2>&1
exit /b 0

:nonode
echo NODE_MISSING > run-status.log
echo Node.js is not installed. Download the LTS version from https://nodejs.org and run this file again.
pause
exit /b 1
