@echo off
REM Tradegist AI Development Startup Script for Windows

echo 🚀 Starting Tradegist AI Platform...

REM Check if we're in the right directory
if not exist "web" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 🐍 Starting Python backend...
cd backend

if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

echo 📦 Activating virtual environment...
call venv\Scripts\activate.bat

echo 📦 Installing dependencies...
pip install -r requirements.txt

echo 🌐 Starting FastAPI server on http://localhost:8000
start "Backend Server" cmd /k "python main.py"

cd ..

echo ⚛️  Starting React frontend...
cd web

if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo 🌐 Starting Vite dev server on http://localhost:3000
start "Frontend Server" cmd /k "npm run dev"

cd ..

echo.
echo ✅ Tradegist AI Platform is starting up!
echo.
echo 📊 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit...
pause > nul
