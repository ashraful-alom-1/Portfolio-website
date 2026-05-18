@echo off
setlocal
cd /d "%~dp0server"

if not exist node_modules (
  echo Installing backend dependencies...
  call npm.cmd install
  if errorlevel 1 exit /b %errorlevel%
)

echo Starting portfolio backend at http://localhost:5000
node server.js
