import React, { useState } from 'react';
import { Plus, Search, ListFilter as Filter, TrendingUp, TrendingDown, Calendar, Tag } from 'lucide-react';
import './TradeLog.css';

interface Trade {
  id: string;
  date: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  tags: string[];
}

const TradeLog: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSide, setFilterSide] = useState<'all' | 'long' | 'short'>('all');

  // Mock trade data
  const trades: Trade[] = [
    {
      id: '1',
      date: '2024-01-15',
      symbol: 'AAPL',
      side: 'long',
      quantity: 100,
      entryPrice: 185.50,
      exitPrice: 192.30,
      pnl: 680,
      tags: ['momentum', 'breakout', 'large_win']
    },
    {
      id: '2',
      date: '2024-01-14',
      symbol: 'TSLA',
      side: 'short',
      quantity: 50,
      entryPrice: 248.75,
      exitPrice: 245.20,
      pnl: 177.50,
      tags: ['reversal', 'disciplined']
    },
    {
      id: '3',
      date: '2024-01-13',
      symbol: 'MSFT',
      side: 'long',
      quantity: 75,
      entryPrice: 412.80,
      exitPrice: 408.90,
      pnl: -292.50,
      tags: ['revenge_trading', 'large_loss']
    }
  ];

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterSide === 'all' || trade.side === filterSide;
    return matchesSearch && matchesFilter;
  });

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = (trades.filter(trade => trade.pnl > 0).length / trades.length) * 100;

  return (
    <div className="trade-log fade-in">
      <div className="trade-log-header">
        <div>
          <h1>Trade Log</h1>
          <p>Track and analyze your trading performance</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={20} />
          Add Trade
        </button>
      </div>

      <div className="trade-stats">
        <div className="stat-item">
          <div className="stat-icon positive">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="stat-label">Total P&L</span>
            <span className={`stat-value ${totalPnL >= 0 ? 'positive' : 'negative'}`}>
              ${totalPnL.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div>
            <span className="stat-label">Total Trades</span>
            <span className="stat-value">{trades.length}</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon positive">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="stat-label">Win Rate</span>
            <span className="stat-value">{winRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="trade-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="filter-group">
          <Filter size={20} />
          <select
            value={filterSide}
            onChange={(e) => setFilterSide(e.target.value as 'all' | 'long' | 'short')}
            className="form-select"
          >
            <option value="all">All Sides</option>
            <option value="long">Long Only</option>
            <option value="short">Short Only</option>
          </select>
        </div>
      </div>

      <div className="trades-table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Quantity</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>P&L</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map((trade) => (
              <tr key={trade.id}>
                <td>{new Date(trade.date).toLocaleDateString()}</td>
                <td className="symbol-cell">{trade.symbol}</td>
                <td>
                  <span className={`side-badge ${trade.side}`}>
                    {trade.side.toUpperCase()}
                  </span>
                </td>
                <td>{trade.quantity}</td>
                <td>${trade.entryPrice.toFixed(2)}</td>
                <td>${trade.exitPrice.toFixed(2)}</td>
                <td className={trade.pnl >= 0 ? 'status-positive' : 'status-negative'}>
                  ${trade.pnl.toFixed(2)}
                </td>
                <td>
                  <div className="tags-cell">
                    {trade.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="categorization-info card">
        <div className="info-header">
          <Tag size={24} />
          <h3>AI Trade Categorization</h3>
        </div>
        <p>
          Our AI system automatically analyzes and categorizes your trades across 15-17 behavioral patterns including:
          revenge trading, overtrading, discipline, momentum plays, and more.
        </p>
        <div className="info-note">
          <strong>Note:</strong> Advanced analysis and auto-categorization features will be implemented in the next phase.
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Trade</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                ×
              </button>
            </div>
            <form className="trade-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Symbol</label>
                  <input type="text" className="form-input" placeholder="AAPL" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Side</label>
                  <select className="form-select">
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" placeholder="100" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Entry Price</label>
                  <input type="number" step="0.01" className="form-input" placeholder="185.50" />
                </div>
                <div className="form-group">
                  <label className="form-label">Exit Price</label>
                  <input type="number" step="0.01" className="form-input" placeholder="192.30" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} placeholder="Trade notes..."></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Trade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeLog;