#!/bin/bash

# Tradegist AI Development Startup Script

echo "🚀 Starting Tradegist AI Platform..."

# Check if we're in the right directory
if [ ! -d "web" ] || [ ! -d "backend" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Function to start backend
start_backend() {
    echo "🐍 Starting Python backend..."
    cd backend
    if [ ! -d "venv" ]; then
        echo "📦 Creating virtual environment..."
        python -m venv venv
    fi
    
    # Activate virtual environment
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        source venv/Scripts/activate
    else
        source venv/bin/activate
    fi
    
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
    
    echo "🌐 Starting FastAPI server on http://localhost:8000"
    python main.py &
    BACKEND_PID=$!
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "⚛️  Starting React frontend..."
    cd web
    
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    echo "🌐 Starting Vite dev server on http://localhost:3000"
    npm run dev &
    FRONTEND_PID=$!
    cd ..
}

# Start both services
start_backend
sleep 3
start_frontend

echo ""
echo "✅ Tradegist AI Platform is starting up!"
echo ""
echo "📊 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

# Keep script running
wait
