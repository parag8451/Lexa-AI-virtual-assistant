@echo off
REM Lexa AI - Setup Script for Windows
REM This script sets up both backend and frontend for development

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Lexa AI - Setup Script (Windows)
echo ========================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js %NODE_VERSION%

REM Setup Backend
echo.
echo Setting up Backend...
cd lexa-backend

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo [WARNING] Please update lexa-backend\.env with your credentials
)

echo Installing dependencies...
call npm install

cd ..

REM Setup Frontend
echo.
echo Setting up Frontend...
cd lexa-frontend

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo [WARNING] Please update lexa-frontend\.env with your credentials
)

echo Installing dependencies...
call npm install

cd ..

echo.
echo [SUCCESS] Setup Complete!
echo.
echo Next steps:
echo 1. Update environment variables:
echo    - lexa-backend\.env
echo    - lexa-frontend\.env
echo.
echo 2. Start development servers:
echo    Terminal 1: cd lexa-backend ^&^& npm run dev
echo    Terminal 2: cd lexa-frontend ^&^& npm run dev
echo.
echo 3. Open http://localhost:5173 in your browser
echo.
echo For detailed setup, see SETUP_GUIDE.md
echo.

endlocal
