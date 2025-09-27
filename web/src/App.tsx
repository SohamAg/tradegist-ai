import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LLMPage from './pages/LLMPage'
import TradeLogPage from './pages/TradeLogPage'
import AIAnalyticsPage from './pages/AIAnalyticsPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/llm" element={<LLMPage />} />
        <Route path="/trades" element={<TradeLogPage />} />
        <Route path="/analytics" element={<AIAnalyticsPage />} />
      </Routes>
    </Layout>
  )
}

export default App
