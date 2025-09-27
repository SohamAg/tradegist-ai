import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import Layout from './components/Layout/Layout';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import TradeLog from './pages/TradeLog';
import AIAnalysis from './pages/AIAnalysis';
import LLMPage from './pages/LLMPage';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/trade-log" element={<Layout><TradeLog /></Layout>} />
            <Route path="/ai-analysis" element={<Layout><AIAnalysis /></Layout>} />
            <Route path="/llm" element={<Layout><LLMPage /></Layout>} />
          </Routes>
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;