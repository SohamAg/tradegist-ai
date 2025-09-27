# Tradegist AI - Advanced Trading Behavior Analysis Platform

A modern, AI-powered trading behavior analysis and journaling platform built with React, TypeScript, and Python.

## Features

- **AI-Powered Analysis**: Advanced machine learning algorithms analyze trading patterns and identify behavioral biases
- **Real-time Analytics**: Comprehensive dashboards with interactive charts showing trading performance
- **Smart Journaling**: Intelligent trade logging with automated insights and pattern recognition
- **AI Chat Assistant**: Get instant answers about trading performance and personalized suggestions
- **Risk Management**: Identify risky trading behaviors and get alerts to protect capital
- **Performance Optimization**: Discover what works best for your trading style

## Tech Stack

### Frontend (web/)
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS with custom gradients and animations
- Framer Motion for smooth animations
- Recharts for interactive data visualization
- React Router for navigation
- Lucide React for modern icons

### Backend (backend/)
- FastAPI for high-performance API
- Python with pandas and numpy for data analysis
- Existing trading analysis modules (ingest, features, rules, labels)
- CORS support for frontend integration

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Frontend Setup
```bash
cd web
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Development
1. Start the backend: `cd backend && python main.py`
2. Start the frontend: `cd web && npm run dev`
3. Open http://localhost:3000

## Project Structure

```
tradegist-ai/
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── ...
│   ├── package.json
│   └── ...
├── backend/                # Python backend
│   ├── app/                # Existing analysis modules
│   ├── data/               # Trading data
│   ├── main.py             # FastAPI server
│   └── requirements.txt
└── README.md
```

## API Endpoints

- `GET /api/trades` - Get all trades
- `POST /api/trades` - Create new trade
- `POST /api/chat` - Chat with AI assistant
- `GET /api/analytics` - Get analytics data
- `POST /api/analyze` - Run full analysis pipeline

## Design Philosophy

The platform features a modern, tech-focused design with:
- Dark theme with gradient accents
- Smooth animations and transitions
- Professional color scheme
- Responsive design for all devices
- Glass morphism effects
- Neon glow effects for interactive elements

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.