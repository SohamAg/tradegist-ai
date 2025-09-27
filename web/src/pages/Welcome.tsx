import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Brain, BarChart3, Target, Zap, Shield, ArrowRight, Star, Activity, PieChart, TrendingDown } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import './Welcome.css';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  const handleLogin = () => {
    // Simulate login with demo user data
    login({
      id: '1',
      name: 'Alex Thompson',
      email: 'alex@tradegist.com'
    });
    navigate('/dashboard');
  };

  const handleSignup = () => {
    // For demo purposes, redirect to login
    handleLogin();
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze your trading patterns and provide actionable insights with 15+ behavioral categories.'
    },
    {
      icon: BarChart3,
      title: 'Comprehensive Analytics',
      description: 'Detailed performance metrics, risk analysis, and trend identification to optimize your trading strategy.'
    },
    {
      icon: Target,
      title: 'Smart Categorization',
      description: 'Automatically categorize trades with behavioral tags like revenge trading, overtrading, and disciplined entries.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Identify dangerous patterns and receive intelligent alerts to protect your capital and improve consistency.'
    }
  ];

  const stats = [
    { icon: Activity, number: '15+', label: 'Behavioral Tags' },
    { icon: PieChart, number: 'AI', label: 'Powered Analysis' },
    { icon: TrendingUp, number: '24/7', label: 'Market Insights' },
    { icon: TrendingDown, number: '∞', label: 'Pattern Recognition' }
  ];

  return (
    <div className="welcome-page">
      {/* Header */}
      <header className="welcome-header">
        <div className="header-content">
          <div className="logo-section">
            <TrendingUp size={36} className="logo-icon" />
            <span className="logo-text gradient-text">Tradegist</span>
            <div className="ai-badge">
              <Zap size={14} />
              <span>AI Powered</span>
            </div>
          </div>
          <div className="header-actions">
            <ThemeToggle />
            <button className="btn btn-ghost" onClick={handleLogin}>
              Login
            </button>
            <button className="btn btn-primary" onClick={handleSignup}>
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title fade-in">
              Transform Your Trading with
              <span className="gradient-text"> AI-Powered Behavioral Analysis</span>
            </h1>
            <p className="hero-description fade-in">
              Discover hidden patterns in your trading behavior, optimize your strategy with advanced analytics, 
              and make data-driven decisions with our comprehensive behavioral analysis platform.
            </p>
            <div className="hero-actions fade-in">
              <button className="btn btn-primary btn-large" onClick={handleSignup}>
                Get Started Free
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-secondary btn-large">
                Watch Demo
              </button>
            </div>
            <div className="hero-stats fade-in">
              {stats.map((stat, index) => (
                <div key={index} className="stat">
                  <div className="stat-icon">
                    <stat.icon size={20} />
                  </div>
                  <div className="stat-content">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card gradient-bg">
              <div className="visual-content">
                <div className="chart-placeholder">
                  <div className="chart-header">
                    <Zap size={16} />
                    <span>AI Analysis Active</span>
                  </div>
                  <div className="chart-bars">
                    <div className="bar" style={{ height: '60%' }}></div>
                    <div className="bar" style={{ height: '80%' }}></div>
                    <div className="bar" style={{ height: '40%' }}></div>
                    <div className="bar" style={{ height: '90%' }}></div>
                    <div className="bar" style={{ height: '70%' }}></div>
                    <div className="bar" style={{ height: '55%' }}></div>
                  </div>
                </div>
                <div className="analysis-tags">
                  <div className="tag success">Disciplined Entry</div>
                  <div className="tag warning">Size Inconsistency</div>
                  <div className="tag danger">Revenge Trading</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <div className="section-header">
            <h2 className="section-title">
              Powerful Features for
              <span className="gradient-text"> Smart Traders</span>
            </h2>
            <p className="section-description">
              Everything you need to understand and improve your trading performance with advanced AI insights
            </p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card fade-in">
                <div className="feature-icon">
                  <feature.icon size={28} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <div className="cta-text">
            <h2 className="cta-title">Ready to Transform Your Trading?</h2>
            <p className="cta-description">
              Join thousands of traders who are already using AI to improve their performance and make better decisions
            </p>
            <div className="cta-features">
              <div className="cta-feature">
                <Star size={16} />
                <span>Free to start</span>
              </div>
              <div className="cta-feature">
                <Star size={16} />
                <span>No credit card required</span>
              </div>
              <div className="cta-feature">
                <Star size={16} />
                <span>Setup in minutes</span>
              </div>
            </div>
          </div>
          <div className="cta-actions">
            <button className="btn btn-primary btn-large" onClick={handleSignup}>
              Start Your Journey
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <TrendingUp size={28} />
            <span className="gradient-text">Tradegist</span>
          </div>
          <p className="footer-text">
            © 2024 Tradegist. Empowering traders with AI-driven behavioral insights.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;