import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Star, Zap, BarChart3, PieChart, Activity, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useUser } from '../contexts/UserContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('1M');

  // Mock data for charts
  const weeklyPnLData = [
    { date: 'Week 1', pnl: 1250, trades: 15 },
    { date: 'Week 2', pnl: -850, trades: 22 },
    { date: 'Week 3', pnl: 2100, trades: 18 },
    { date: 'Week 4', pnl: 750, trades: 20 },
  ];

  const radarData = [
    { subject: 'Risk Management', A: 80, fullMark: 100 },
    { subject: 'Discipline', A: 65, fullMark: 100 },
    { subject: 'Consistency', A: 90, fullMark: 100 },
    { subject: 'Entry Timing', A: 75, fullMark: 100 },
    { subject: 'Exit Strategy', A: 85, fullMark: 100 },
    { subject: 'Position Sizing', A: 70, fullMark: 100 },
  ];

  const stats = [
    {
      title: 'Total P&L',
      value: '+$3,250',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'success'
    },
    {
      title: 'Win Rate',
      value: '68%',
      change: '+5.2%',
      trend: 'up',
      icon: Target,
      color: 'primary'
    },
    {
      title: 'Total Trades',
      value: '75',
      change: '+8 this week',
      trend: 'up',
      icon: Activity,
      color: 'secondary'
    },
    {
      title: 'Avg Trade',
      value: '$43.33',
      change: '-2.1%',
      trend: 'down',
      icon: BarChart3,
      color: 'warning'
    }
  ];

  const behavioralInsights = [
    {
      category: 'Revenge Trading',
      score: 25,
      status: 'good',
      description: 'Low tendency for emotional revenge trades'
    },
    {
      category: 'Overtrading',
      score: 45,
      status: 'warning',
      description: 'Moderate overtrading detected on high volatility days'
    },
    {
      category: 'Disciplined Entries',
      score: 85,
      status: 'excellent',
      description: 'Excellent adherence to entry criteria'
    },
    {
      category: 'Risk Management',
      score: 78,
      status: 'good',
      description: 'Good position sizing and stop-loss discipline'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'var(--success)';
      case 'good': return 'var(--primary)';
      case 'warning': return 'var(--warning)';
      case 'poor': return 'var(--danger)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section fade-in">
        <div className="welcome-content">
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-text">{user?.name || 'Alex'}</span>
          </h1>
          <p className="welcome-subtitle">
            Here's your trading performance overview powered by AI analysis
          </p>
        </div>
        <div className="ai-status">
          <div className="ai-indicator">
            <Zap size={20} />
            <span>AI Analysis Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid fade-in">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div className={`stat-trend ${stat.trend}`}>
                {stat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
            </div>
            <div className="stat-content">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-title">{stat.title}</p>
              <span className={`stat-change ${stat.trend}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container card fade-in">
          <div className="card-header">
            <div>
              <h3 className="card-title">Weekly P&L Overview</h3>
              <p className="card-description">Your profit and loss performance over the past month</p>
            </div>
            <div className="period-selector">
              {['1W', '1M', '3M', '1Y'].map((period) => (
                <button
                  key={period}
                  className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyPnLData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary)', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="radar-container card fade-in">
          <div className="card-header">
            <h3 className="card-title">AI Performance Analysis</h3>
            <p className="card-description">Your trading skills breakdown</p>
          </div>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <PolarRadiusAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
                <Radar
                  name="Performance"
                  dataKey="A"
                  stroke="var(--primary)"
                  fill="var(--primary)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Behavioral Insights */}
      <div className="insights-section fade-in">
        <div className="insights-header">
          <h2 className="section-title">
            <Star size={24} />
            AI Behavioral Insights
          </h2>
          <p className="section-description">
            Advanced analysis of your trading patterns with 15+ behavioral categories
          </p>
        </div>
        <div className="insights-grid">
          {behavioralInsights.map((insight, index) => (
            <div key={index} className="insight-card card">
              <div className="insight-header">
                <h4 className="insight-title">{insight.category}</h4>
                <div className="insight-score" style={{ color: getStatusColor(insight.status) }}>
                  {insight.score}/100
                </div>
              </div>
              <div className="insight-progress">
                <div 
                  className="progress-bar"
                  style={{ 
                    width: `${insight.score}%`,
                    backgroundColor: getStatusColor(insight.status)
                  }}
                ></div>
              </div>
              <p className="insight-description">{insight.description}</p>
              <div className={`insight-status ${insight.status}`}>
                {insight.status.charAt(0).toUpperCase() + insight.status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Section */}
      <div className="calendar-section card fade-in">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Calendar size={24} />
              Trading Calendar
            </h3>
            <p className="card-description">Navigate your trading history by date</p>
          </div>
        </div>
        <div className="calendar-placeholder">
          <div className="calendar-grid">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className={`calendar-day ${i % 7 === 0 || i % 7 === 6 ? 'weekend' : ''} ${i === 15 ? 'today' : ''} ${[5, 12, 18, 25].includes(i) ? 'has-trades' : ''}`}>
                {i + 1 <= 31 ? i + 1 : ''}
              </div>
            ))}
          </div>
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-dot today"></div>
              <span>Today</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot has-trades"></div>
              <span>Trading Days</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot weekend"></div>
              <span>Weekends</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;