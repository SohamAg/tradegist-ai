import React from 'react';
import { Brain, TrendingUp, TriangleAlert as AlertTriangle, Target, Zap } from 'lucide-react';
import './AIAnalysis.css';

const AIAnalysis: React.FC = () => {
  return (
    <div className="ai-analysis fade-in">
      <div className="page-header">
        <div className="header-content">
          <div className="header-icon">
            <Brain size={32} />
          </div>
          <div>
            <h1>AI Advanced Analysis</h1>
            <p>Deep behavioral insights powered by machine learning</p>
          </div>
        </div>
        <div className="ai-badge">
          <Zap size={16} />
          <span>Advanced AI</span>
        </div>
      </div>

      <div className="analysis-grid">
        <div className="analysis-card card">
          <div className="card-header">
            <TrendingUp className="card-icon success" />
            <h3>Performance Patterns</h3>
          </div>
          <div className="placeholder-content">
            <div className="placeholder-chart">
              <div className="chart-bars">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar" style={{ height: '45%' }}></div>
                <div className="bar" style={{ height: '90%' }}></div>
                <div className="bar" style={{ height: '70%' }}></div>
              </div>
            </div>
            <p>Advanced pattern recognition algorithms will analyze your trading performance across multiple timeframes and market conditions.</p>
          </div>
        </div>

        <div className="analysis-card card">
          <div className="card-header">
            <AlertTriangle className="card-icon warning" />
            <h3>Risk Assessment</h3>
          </div>
          <div className="placeholder-content">
            <div className="risk-meter">
              <div className="meter-arc">
                <div className="meter-fill" style={{ transform: 'rotate(45deg)' }}></div>
              </div>
              <div className="meter-label">Medium Risk</div>
            </div>
            <p>AI-powered risk analysis will evaluate your position sizing, correlation exposure, and drawdown patterns.</p>
          </div>
        </div>

        <div className="analysis-card card">
          <div className="card-header">
            <Target className="card-icon primary" />
            <h3>Behavioral Insights</h3>
          </div>
          <div className="placeholder-content">
            <div className="insights-list">
              <div className="insight-placeholder">
                <div className="insight-dot positive"></div>
                <span>Discipline Score: 78/100</span>
              </div>
              <div className="insight-placeholder">
                <div className="insight-dot warning"></div>
                <span>Revenge Trading: 3 instances</span>
              </div>
              <div className="insight-placeholder">
                <div className="insight-dot positive"></div>
                <span>Consistency: Improving</span>
              </div>
            </div>
            <p>Machine learning models will identify and track 15+ behavioral patterns to help improve your trading psychology.</p>
          </div>
        </div>

        <div className="analysis-card card full-width">
          <div className="card-header">
            <Brain className="card-icon primary" />
            <h3>AI Recommendations</h3>
          </div>
          <div className="recommendations-grid">
            <div className="recommendation-item">
              <div className="rec-icon positive">
                <TrendingUp size={20} />
              </div>
              <div>
                <h4>Optimize Position Sizing</h4>
                <p>Consider reducing position size by 15% during high volatility periods based on your historical performance.</p>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="rec-icon warning">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4>Avoid Revenge Trading</h4>
                <p>Take a 30-minute break after losses exceeding 2% to prevent emotional decision-making.</p>
              </div>
            </div>
            <div className="recommendation-item">
              <div className="rec-icon primary">
                <Target size={20} />
              </div>
              <div>
                <h4>Focus on Best Setups</h4>
                <p>Your momentum breakout trades show 85% win rate. Consider increasing allocation to this strategy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="coming-soon-notice card">
        <div className="notice-header">
          <Brain size={24} />
          <h3>Advanced AI Features Coming Soon</h3>
        </div>
        <p>
          We're developing cutting-edge machine learning models that will provide:
        </p>
        <ul>
          <li>Real-time behavioral pattern detection</li>
          <li>Predictive risk assessment</li>
          <li>Personalized trading recommendations</li>
          <li>Market regime analysis</li>
          <li>Performance optimization suggestions</li>
        </ul>
        <div className="notice-footer">
          <span>Expected Release: Q2 2024</span>
        </div>
      </div>
    </div>
  );
};

export default AIAnalysis;