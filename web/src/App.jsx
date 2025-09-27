import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TradeLog from './pages/TradeLog';
import AIAnalysis from './pages/AIAnalysis';
import LLMPage from './pages/LLMPage';
import Navigation from './components/Navigation';
import Header from './components/Header';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="app-container">
      <Header />
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trade-log" element={<TradeLog />} />
          <Route path="/ai-analysis" element={<AIAnalysis />} />
          <Route path="/llm" element={<LLMPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;