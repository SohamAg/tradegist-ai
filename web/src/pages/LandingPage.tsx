import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, Brain, BarChart3, Sparkles } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const { login } = useAuth();

  const handleLogin = () => {
    // Mock login - just redirect to dashboard
    login('demo@tradegist.ai', 'password');
  };

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-nav">
          <div className="logo">
            <Sparkles className="logo-icon" />
            <span className="gradient-text">TradegistAI</span>
          </div>
          <div className="nav-actions">
            <ThemeToggle />
            <button className="btn btn-secondary">Sign Up</button>
            <button className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <Brain size={16} />
              <span>AI-Powered Trading Analysis</span>
            </div>
            
            <h1 className="hero-title">
              Master Your Trading with
              <span className="gradient-text"> AI-Driven Insights</span>
            </h1>
            
            <p className="hero-description">
              Transform your trading behavior with advanced AI analysis, comprehensive journaling, 
              and personalized insights that help you become a more disciplined and profitable trader.
            </p>
            
            <div className="hero-actions">
              <button className="btn btn-primary btn-large" onClick={handleLogin}>
                Start Trading Smarter
              </button>
              <button className="btn btn-secondary btn-large">
                Watch Demo
              </button>
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="floating-card card-1">
              <TrendingUp size={24} />
              <span>+24.5% This Month</span>
            </div>
            <div className="floating-card card-2">
              <BarChart3 size={24} />
              <span>AI Analysis Ready</span>
            </div>
            <div className="floating-card card-3">
              <Brain size={24} />
              <span>15+ Behavior Patterns</span>
            </div>
          </div>
        </section>

        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <Brain size={32} />
              </div>
              <h3>AI-Powered Analysis</h3>
              <p>Advanced machine learning algorithms analyze your trading patterns and provide actionable insights.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <BarChart3 size={32} />
              </div>
              <h3>Comprehensive Journaling</h3>
              <p>Track every trade with detailed logging and automatic categorization across 15+ behavioral patterns.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <TrendingUp size={32} />
              </div>
              <h3>Performance Insights</h3>
              <p>Visualize your progress with interactive charts and personalized performance metrics.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;