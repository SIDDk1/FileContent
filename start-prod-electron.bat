@echo off
REM Delegate production build/start/electron to Node runner with unified logs
node scripts\run-prod-electron.js
if %ERRORLEVEL% neq 0 (
  echo Run failed. See output above.
  pause
  exit /b %ERRORLEVEL%
)
echo Done.
pause
