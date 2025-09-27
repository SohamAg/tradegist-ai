import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Brain, Sparkles, ChartBar as BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data for charts
  const weeklyPnLData = [
    { date: 'Week 1', pnl: 1250 },
    { date: 'Week 2', pnl: -800 },
    { date: 'Week 3', pnl: 2100 },
    { date: 'Week 4', pnl: 1800 },
  ];

  const radarData = [
    { subject: 'Risk Management', A: 80, fullMark: 100 },
    { subject: 'Discipline', A: 65, fullMark: 100 },
    { subject: 'Patience', A: 90, fullMark: 100 },
    { subject: 'Analysis', A: 75, fullMark: 100 },
    { subject: 'Execution', A: 85, fullMark: 100 },
    { subject: 'Emotional Control', A: 70, fullMark: 100 },
  ];

  const stats = [
    {
      title: 'Total P&L',
      value: '+$4,350',
      change: '+12.5%',
      icon: DollarSign,
      positive: true
    },
    {
      title: 'Win Rate',
      value: '68%',
      change: '+5.2%',
      icon: TrendingUp,
      positive: true
    },
    {
      title: 'Avg Trade',
      value: '+$125',
      change: '-2.1%',
      icon: BarChart3,
      positive: false
    },
    {
      title: 'Active Days',
      value: '23',
      change: '+8.7%',
      icon: Calendar,
      positive: true
    }
  ];

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Here's your trading performance overview</p>
        </div>
        <div className="ai-badge-large">
          <Sparkles size={20} />
          <span>AI Powered Analysis</span>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <span className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.change}
                </span>
              </div>
              <div className="stat-content">
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-title">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="chart-card card">
          <div className="card-header">
            <h3>Weekly P&L Trend</h3>
            <TrendingUp className="card-icon" />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyPnLData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="date" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="var(--accent-blue)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--accent-blue)', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="calendar-card card">
          <div className="card-header">
            <h3>Trading Calendar</h3>
            <Calendar className="card-icon" />
          </div>
          <div className="calendar-placeholder">
            <div className="calendar-grid">
              {Array.from({ length: 30 }, (_, i) => (
                <div 
                  key={i} 
                  className={`calendar-day ${Math.random() > 0.7 ? 'active' : ''} ${Math.random() > 0.8 ? 'profitable' : ''}`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="radar-card card">
          <div className="card-header">
            <h3>AI Behavior Analysis</h3>
            <Brain className="card-icon" />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border-color)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                />
                <Radar
                  name="Score"
                  dataKey="A"
                  stroke="var(--accent-purple)"
                  fill="var(--accent-purple)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="insights-card card">
          <div className="card-header">
            <h3>AI Insights</h3>
            <Sparkles className="card-icon" />
          </div>
          <div className="insights-content">
            <div className="insight-item">
              <div className="insight-icon positive">
                <TrendingUp size={16} />
              </div>
              <div>
                <h4>Improved Discipline</h4>
                <p>Your position sizing has been more consistent this week</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon warning">
                <TrendingDown size={16} />
              </div>
              <div>
                <h4>Revenge Trading Alert</h4>
                <p>Detected 3 instances of revenge trading patterns</p>
              </div>
            </div>
            <div className="insight-item">
              <div className="insight-icon positive">
                <Brain size={16} />
              </div>
              <div>
                <h4>Pattern Recognition</h4>
                <p>Strong performance on momentum breakout setups</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;