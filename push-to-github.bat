@echo off
title EnviroMET - upload to GitHub
cd /d "%~dp0"
set REPO=https://github.com/kareemshehab/enviromet.git
echo ==================================================
echo   Upload EnviroMET to GitHub
echo   %REPO%
echo ==================================================
echo.
where git >nul 2>nul || goto :nogit

rem 1. Turn this folder into a Git working copy linked to GitHub (first run only)
if not exist .git (
  git init -b main || goto :fail
)
git remote get-url origin >nul 2>nul || git remote add origin %REPO%

rem Commit author: your own Git settings if you have them, otherwise your GitHub username
git config user.name >nul 2>nul || git config user.name "kareemshehab"
git config user.email >nul 2>nul || git config user.email "kareemshehab@users.noreply.github.com"

rem 2. Commit everything that is not in .gitignore (secrets, database, media and logs are excluded)
git add -A || goto :fail
git diff --cached --quiet && echo Nothing new to commit. || git commit -q -m "EnviroMET website: Next.js + Payload CMS" || goto :fail

rem 3. If the GitHub repository already has commits (e.g. a README made on GitHub), merge them
rem    first, keeping this folder's version of any file that exists in both.
echo.
echo Connecting to GitHub (a browser window may ask you to sign in the first time)...
git ls-remote --exit-code --heads origin main >nul 2>nul
if not errorlevel 1 (
  git pull --no-rebase --no-edit --allow-unrelated-histories -X ours origin main || goto :fail
)

rem 4. Upload
git push -u origin main || goto :fail
echo.
echo Done. The project is on GitHub and this folder is linked to it.
echo From now on: commit your changes in VS Code (Source Control) or run this file again.
echo.
pause
exit /b 0

:nogit
echo Git is not installed. Install it from https://git-scm.com/download/win
echo (keep the default options), then run this file again.
pause
exit /b 1

:fail
echo.
echo Something went wrong - see the messages above.
pause
exit /b 1
