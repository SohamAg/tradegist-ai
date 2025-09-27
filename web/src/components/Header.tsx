import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import './Header.css';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={onMenuClick}>
          <Menu size={24} />
        </button>
        <div className="logo">
          <span className="gradient-text">TradegistAI</span>
        </div>
      </div>

      <div className="header-right">
        <ThemeToggle />
        <div className="user-info">
          <User size={20} />
          <span>{user?.name}</span>
        </div>
        <button className="logout-btn" onClick={logout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;