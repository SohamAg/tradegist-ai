import React, { useState } from 'react';
import { Plus, Search, ListFilter as Filter, TrendingUp, TrendingDown, Calendar, DollarSign, Tag, Eye, CreditCard as Edit, Trash2, X } from 'lucide-react';
import './TradeLog.css';

interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'long' | 'short';
  entry: number;
  exit: number;
  quantity: number;
  pnl: number;
  tags: string[];
  notes?: string;
}

const TradeLog: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  // Mock trade data
  const [trades] = useState<Trade[]>([
    {
      id: '1',
      date: '2024-01-15',
      symbol: 'AAPL',
      type: 'long',
      entry: 185.50,
      exit: 192.30,
      quantity: 100,
      pnl: 680,
      tags: ['disciplined-entry', 'good-timing'],
      notes: 'Strong breakout above resistance'
    },
    {
      id: '2',
      date: '2024-01-14',
      symbol: 'TSLA',
      type: 'short',
      entry: 248.90,
      exit: 245.20,
      quantity: 50,
      pnl: 185,
      tags: ['momentum-trade', 'quick-scalp'],
      notes: 'Bearish momentum after earnings'
    },
    {
      id: '3',
      date: '2024-01-13',
      symbol: 'NVDA',
      type: 'long',
      entry: 520.00,
      exit: 515.80,
      quantity: 25,
      pnl: -105,
      tags: ['revenge-trading', 'poor-entry'],
      notes: 'Should have waited for better setup'
    },
    {
      id: '4',
      date: '2024-01-12',
      symbol: 'MSFT',
      type: 'long',
      entry: 375.20,
      exit: 382.50,
      quantity: 75,
      pnl: 547.50,
      tags: ['disciplined-entry', 'trend-following'],
      notes: 'Perfect trend continuation trade'
    },
    {
      id: '5',
      date: '2024-01-11',
      symbol: 'AMZN',
      type: 'short',
      entry: 155.80,
      exit: 158.90,
      quantity: 40,
      pnl: -124,
      tags: ['overtrading', 'impatience'],
      notes: 'Entered too early, market reversed'
    }
  ]);

  // Available tags for categorization
  const availableTags = [
    'disciplined-entry', 'revenge-trading', 'overtrading', 'good-timing',
    'poor-entry', 'momentum-trade', 'trend-following', 'breakout-trade',
    'support-resistance', 'quick-scalp', 'swing-trade', 'news-driven',
    'technical-setup', 'fundamental-play', 'risk-management', 'impatience',
    'fomo-trade'
  ];

  const getTagColor = (tag: string) => {
    const positiveTagsColors = {
      'disciplined-entry': 'var(--success)',
      'good-timing': 'var(--success)',
      'trend-following': 'var(--primary)',
      'momentum-trade': 'var(--primary)',
      'technical-setup': 'var(--primary)',
      'risk-management': 'var(--success)',
      'breakout-trade': 'var(--accent)',
      'support-resistance': 'var(--accent)',
      'swing-trade': 'var(--secondary)',
      'fundamental-play': 'var(--secondary)'
    };

    const negativeTagsColors = {
      'revenge-trading': 'var(--danger)',
      'overtrading': 'var(--danger)',
      'poor-entry': 'var(--warning)',
      'impatience': 'var(--warning)',
      'fomo-trade': 'var(--danger)'
    };

    return positiveTagsColors[tag as keyof typeof positiveTagsColors] || 
           negativeTagsColors[tag as keyof typeof negativeTagsColors] || 
           'var(--text-muted)';
  };

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'profitable' && trade.pnl > 0) ||
                         (filterType === 'losing' && trade.pnl < 0);
    return matchesSearch && matchesFilter;
  });

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = (trades.filter(trade => trade.pnl > 0).length / trades.length) * 100;

  return (
    <div className="trade-log">
      {/* Header */}
      <div className="trade-log-header fade-in">
        <div className="header-content">
          <div>
            <h1 className="page-title">Trade Log</h1>
            <p className="page-description">
              Track and analyze your trades with AI-powered categorization
            </p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            Add Trade
          </button>
        </div>
        
        {/* Stats Summary */}
        <div className="stats-summary">
          <div className="summary-stat">
            <div className="stat-icon success">
              <DollarSign size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">${totalPnL.toFixed(2)}</span>
              <span className="stat-label">Total P&L</span>
            </div>
          </div>
          <div className="summary-stat">
            <div className="stat-icon primary">
              <TrendingUp size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{winRate.toFixed(1)}%</span>
              <span className="stat-label">Win Rate</span>
            </div>
          </div>
          <div className="summary-stat">
            <div className="stat-icon secondary">
              <Tag size={20} />
            </div>
            <div className="stat-info">
              <span className="stat-value">{trades.length}</span>
              <span className="stat-label">Total Trades</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="trade-controls fade-in">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search trades by symbol or notes..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <Filter size={20} className="filter-icon" />
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Trades</option>
            <option value="profitable">Profitable</option>
            <option value="losing">Losing</option>
          </select>
        </div>
      </div>

      {/* AI Analysis Note */}
      <div className="ai-analysis-note card fade-in">
        <div className="note-content">
          <div className="note-icon">
            <Tag size={20} />
          </div>
          <div className="note-text">
            <h4>AI-Powered Trade Categorization</h4>
            <p>
              Our advanced AI system automatically analyzes your trades and assigns behavioral tags 
              from 15+ categories including revenge trading, overtrading, disciplined entries, and more. 
              <strong> Analysis and auto-categorization features will be implemented in the next update.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Trades Table */}
      <div className="trades-table-container card fade-in">
        <div className="table-header">
          <h3>Recent Trades</h3>
          <span className="trade-count">{filteredTrades.length} trades</span>
        </div>
        
        <div className="trades-table">
          <div className="table-header-row">
            <div className="table-cell">Date</div>
            <div className="table-cell">Symbol</div>
            <div className="table-cell">Type</div>
            <div className="table-cell">Entry</div>
            <div className="table-cell">Exit</div>
            <div className="table-cell">Qty</div>
            <div className="table-cell">P&L</div>
            <div className="table-cell">Tags</div>
            <div className="table-cell">Actions</div>
          </div>
          
          {filteredTrades.map((trade) => (
            <div key={trade.id} className="table-row">
              <div className="table-cell">
                <div className="date-cell">
                  <Calendar size={16} />
                  {new Date(trade.date).toLocaleDateString()}
                </div>
              </div>
              <div className="table-cell">
                <span className="symbol">{trade.symbol}</span>
              </div>
              <div className="table-cell">
                <span className={`trade-type ${trade.type}`}>
                  {trade.type === 'long' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {trade.type.toUpperCase()}
                </span>
              </div>
              <div className="table-cell">${trade.entry.toFixed(2)}</div>
              <div className="table-cell">${trade.exit.toFixed(2)}</div>
              <div className="table-cell">{trade.quantity}</div>
              <div className="table-cell">
                <span className={`pnl ${trade.pnl >= 0 ? 'positive' : 'negative'}`}>
                  ${trade.pnl.toFixed(2)}
                </span>
              </div>
              <div className="table-cell">
                <div className="tags-container">
                  {trade.tags.slice(0, 2).map((tag) => (
                    <span 
                      key={tag} 
                      className="trade-tag"
                      style={{ backgroundColor: `${getTagColor(tag)}20`, color: getTagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                  {trade.tags.length > 2 && (
                    <span className="more-tags">+{trade.tags.length - 2}</span>
                  )}
                </div>
              </div>
              <div className="table-cell">
                <div className="action-buttons">
                  <button 
                    className="action-btn view"
                    onClick={() => setSelectedTrade(trade)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                  <button className="action-btn edit" title="Edit Trade">
                    <Edit size={16} />
                  </button>
                  <button className="action-btn delete" title="Delete Trade">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Trade</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <form className="trade-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Symbol</label>
                  <input type="text" className="form-input" placeholder="AAPL" required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="form-select" required>
                    <option value="">Select Type</option>
                    <option value="long">Long</option>
                    <option value="short">Short</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" className="form-input" placeholder="100" required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Entry Price</label>
                  <input type="number" step="0.01" className="form-input" placeholder="185.50" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Exit Price</label>
                  <input type="number" step="0.01" className="form-input" placeholder="192.30" required />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tags (Select applicable behavioral patterns)</label>
                <div className="tags-selector">
                  {availableTags.map((tag) => (
                    <label key={tag} className="tag-checkbox">
                      <input type="checkbox" />
                      <span 
                        className="tag-label"
                        style={{ borderColor: getTagColor(tag), color: getTagColor(tag) }}
                      >
                        {tag}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Add any notes about this trade..."
                  rows={3}
                ></textarea>
              </div>
              
              <div className="form-actions">
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

      {/* Trade Details Modal */}
      {selectedTrade && (
        <div className="modal-overlay" onClick={() => setSelectedTrade(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Trade Details - {selectedTrade.symbol}</h3>
              <button 
                className="close-btn"
                onClick={() => setSelectedTrade(null)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="trade-details">
              <div className="detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{new Date(selectedTrade.date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className={`detail-value trade-type ${selectedTrade.type}`}>
                  {selectedTrade.type === 'long' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {selectedTrade.type.toUpperCase()}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Entry Price:</span>
                <span className="detail-value">${selectedTrade.entry.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Exit Price:</span>
                <span className="detail-value">${selectedTrade.exit.toFixed(2)}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Quantity:</span>
                <span className="detail-value">{selectedTrade.quantity}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">P&L:</span>
                <span className={`detail-value pnl ${selectedTrade.pnl >= 0 ? 'positive' : 'negative'}`}>
                  ${selectedTrade.pnl.toFixed(2)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Tags:</span>
                <div className="detail-tags">
                  {selectedTrade.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="trade-tag"
                      style={{ backgroundColor: `${getTagColor(tag)}20`, color: getTagColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {selectedTrade.notes && (
                <div className="detail-row">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{selectedTrade.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeLog;