import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import LLMPage from './pages/LLMPage'
import TradeLogPage from './pages/TradeLogPage'
import AIAnalyticsPage from './pages/AIAnalyticsPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/home" element={
        <Layout>
          <LandingPage />
        </Layout>
      } />
      <Route path="/llm" element={
        <Layout>
          <LLMPage />
        </Layout>
      } />
      <Route path="/trades" element={
        <Layout>
          <TradeLogPage />
        </Layout>
      } />
      <Route path="/analytics" element={
        <Layout>
          <AIAnalyticsPage />
        </Layout>
      } />
    </Routes>
  )
}

export default App
