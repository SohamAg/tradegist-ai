import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  Brain, 
  MessageSquare, 
  X,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/trade-log', icon: BookOpen, label: 'Trade Log' },
    { path: '/ai-analysis', icon: Brain, label: 'AI Advanced Analysis' },
    { path: '/llm', icon: MessageSquare, label: 'LLM Assistant' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <TrendingUp size={24} className="logo-icon" />
          <span className="sidebar-title">Navigation</span>
        </div>
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  `nav-link ${isActive ? 'nav-link-active' : ''}`
                }
                onClick={onClose}
              >
                <item.icon size={20} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
        
        <div className="sidebar-footer">
          <div className="ai-powered-badge">
            <BarChart3 size={16} />
            <span>AI-Powered Analytics</span>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;