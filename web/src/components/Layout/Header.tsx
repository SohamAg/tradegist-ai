import React from 'react';
import { Menu, User, Bell, Zap } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="logo">
          <span className="logo-text gradient-text">Tradegist</span>
          <div className="ai-badge">
            <Zap size={14} />
            <span>AI Powered</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <ThemeToggle />
        <button className="notification-button">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <div className="user-info" onClick={handleLogout}>
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.name || 'John Doe'}</span>
            <span className="user-email">{user?.email || 'john@example.com'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;