# Tradegist AI 🚀

**Advanced Trading Behavior Analysis Platform**

Tradegist AI is a comprehensive trading behavior analysis platform that combines machine learning, behavioral psychology, and AI coaching to help traders improve their decision-making, emotional control, and trading discipline.

## 🌟 Features

### 📊 **AI Analytics Dashboard**
- **Behavioral Starplot**: Interactive radar chart showing 8 key behavioral dimensions
- **Real-time Performance Metrics**: Win rate, P&L analysis, risk metrics
- **Top Performing Tickers**: Performance breakdown with detailed statistics
- **Trade Statistics & Records**: Best/worst trades, win/loss streaks, averages
- **Recent Trade History**: Last 20 trades with mood and behavioral tags

### 🤖 **AI Trading Behavior Coach**
- **Personalized Coaching**: AI-powered behavioral analysis and recommendations
- **Context-Aware Responses**: Analyzes selected trades and behavioral patterns
- **Comprehensive Report Generation**: Download detailed PDF behavioral reports
- **Quick Request Buttons**: Pre-built queries for common behavioral analysis
- **Voice Input Support**: Hands-free interaction (Cedar OS integration)

### 📈 **Behavioral Analysis Engine**
- **Pattern Recognition**: Identifies revenge trading, overtrading, and emotional patterns
- **Mood Impact Analysis**: Correlates emotional state with trading performance
- **Risk Management Assessment**: Evaluates position sizing and discipline
- **Tag Frequency Analysis**: Tracks behavioral patterns over time
- **Day-by-Day Scoring**: Overtrading, focus, and bias detection

### 💾 **Data Management**
- **CSV Import Pipeline**: Automated data processing and analysis
- **Supabase Integration**: Real-time database synchronization
- **Complete Data Reset**: Fresh start capability for new datasets
- **Trade History Tracking**: Comprehensive trade logging with behavioral tags

## 🏗️ Architecture

### **Frontend (React + TypeScript)**
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Interactive Charts**: Recharts for data visualization
- **Smooth Animations**: Framer Motion for enhanced UX
- **Responsive Design**: Works seamlessly across all devices

### **Backend (Python + FastAPI)**
- **RESTful API**: FastAPI for high-performance API endpoints
- **AI Integration**: OpenAI GPT-3.5-turbo for behavioral coaching
- **Database Management**: PostgreSQL with Supabase
- **PDF Generation**: ReportLab for comprehensive reports

### **Data Pipeline**
- **Feature Engineering**: Advanced trading pattern detection
- **Behavioral Scoring**: ML-based behavioral analysis
- **Rule Engine**: Automated tag generation and pattern recognition
- **Real-time Processing**: Live data ingestion and analysis

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **PostgreSQL** (or Supabase account)
- **OpenAI API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/tradegist-ai.git
   cd tradegist-ai
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Frontend Setup**
   ```bash
   cd web
   npm install
   ```

4. **Environment Configuration**
   ```bash
   # Create backend/.env file
   OPEN_AI_KEY=your_openai_api_key_here
   DATABASE_URL=your_supabase_database_url
   TG_USER_ID=your_user_id
   ```

5. **Start the Application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python main.py

   # Terminal 2 - Frontend
   cd web
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 📋 Usage Guide

### **1. Data Import**
1. Navigate to the Trade Log page
2. Click "Reset All Data" to clear existing data
3. Upload your CSV file with trade data
4. Wait for the processing pipeline to complete

### **2. Analytics Dashboard**
1. Go to the AI Analytics page
2. Explore your behavioral patterns and performance metrics
3. Review the interactive charts and insights
4. Analyze your top performing tickers and trade statistics

### **3. AI Behavior Coach**
1. Visit the LLM page
2. Select specific trades for context (optional)
3. Ask questions about your trading behavior
4. Use quick request buttons for common analyses
5. Generate comprehensive behavioral reports

### **4. Trade Management**
1. Use the Trade Log page to view all your trades
2. Filter and search through your trading history
3. Review behavioral tags and mood patterns
4. Export data for external analysis

## 🔧 API Endpoints

### **Trade Management**
- `GET /api/trades` - Get all trades
- `POST /api/trades` - Create new trade
- `GET /api/trades/{trade_id}` - Get specific trade

### **Data Import & Analysis**
- `POST /api/import-csv` - Import CSV data
- `POST /api/reset-data` - Reset all data
- `POST /api/analyze` - Run analysis pipeline

### **AI Features**
- `POST /api/chat` - Chat with AI behavior coach
- `POST /api/generate-report` - Generate PDF report
- `GET /api/analytics` - Get analytics data

## 📊 Data Format

### **CSV Import Format**
Your CSV file should contain the following columns:
```csv
date,ticker,side,quantity,entry_price,exit_price,fees,strategy,notes,mood,status
2024-01-15,AAPL,buy,100,150.00,155.00,1.00,swing,Good setup,confident,closed
```

### **Supported Trade Sides**
- `buy` / `cover` - Long positions
- `sell` / `short` - Short positions

### **Mood Tracking**
Track your emotional state for each trade:
- `confident`, `frustrated`, `anxious`, `excited`, `calm`, `greedy`, `fearful`

## 🎯 Behavioral Analysis

### **Key Metrics**
- **Behavioral Score**: Overall trading discipline (75-85 range)
- **Risk Management**: Position sizing consistency
- **Emotional Control**: Revenge trading detection
- **Discipline**: Rule adherence and consistency
- **Patience**: Overtrading prevention
- **Focus**: Trading session quality
- **Adaptability**: Strategy adjustment capability
- **Profitability**: Win rate and P&L consistency

### **Behavioral Tags**
The system automatically detects and tags:
- **Revenge Trade**: Trading after losses
- **Overtrading Day**: Excessive trade frequency
- **Size Inconsistency**: Inconsistent position sizing
- **Consistent Size**: Proper position sizing
- **Focused Day**: High-quality trading sessions
- **Chop Day**: Difficult market conditions

## 🔒 Security & Privacy

- **Data Encryption**: All data encrypted in transit and at rest
- **User Isolation**: Complete data separation between users
- **API Security**: Secure API endpoints with proper authentication
- **Privacy First**: No data sharing with third parties

## 🛠️ Development

### **Project Structure**
```
tradegist-ai/
├── backend/
│   ├── app/           # Core application modules
│   ├── data/          # Sample data and uploads
│   ├── main.py        # FastAPI application
│   └── requirements.txt
├── web/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
└── README.md
```

### **Contributing**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Testing**
```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd web
npm test
```

## 📈 Performance

- **Real-time Processing**: Sub-second response times
- **Scalable Architecture**: Handles thousands of trades
- **Efficient Database**: Optimized queries and indexing
- **Caching**: Smart caching for improved performance

## 🐛 Troubleshooting

### **Common Issues**

**CSV Import Fails**
- Check CSV format matches expected columns
- Ensure all required fields are present
- Verify file encoding (UTF-8 recommended)

**AI Responses Not Working**
- Verify OpenAI API key is set correctly
- Check API key has sufficient credits
- Ensure backend server is running

**Database Connection Issues**
- Verify Supabase credentials
- Check network connectivity
- Ensure database is accessible

**Frontend Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version compatibility
- Verify all dependencies are installed

## 📞 Support

- **Documentation**: [Full Documentation](https://docs.tradegist-ai.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/tradegist-ai/issues)
- **Discord**: [Community Support](https://discord.gg/tradegist-ai)
- **Email**: support@tradegist-ai.com

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-3.5-turbo API
- **Supabase** for database infrastructure
- **Cedar OS** for modern UI components
- **Recharts** for data visualization
- **FastAPI** for high-performance API framework

## 🚀 Roadmap

### **Upcoming Features**
- [ ] **Mobile App**: iOS and Android applications
- [ ] **Advanced ML Models**: Custom behavioral prediction models
- [ ] **Social Features**: Trading community and leaderboards
- [ ] **Integration APIs**: Connect with major brokers
- [ ] **Advanced Analytics**: Machine learning insights
- [ ] **Voice Commands**: Full voice interaction support

### **Version History**
- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added AI behavior coach
- **v1.2.0** - Enhanced analytics dashboard
- **v1.3.0** - Comprehensive report generation

---

**Built with ❤️ for traders who want to improve their behavioral patterns and trading discipline.**

*Tradegist AI - Where Psychology Meets Performance*