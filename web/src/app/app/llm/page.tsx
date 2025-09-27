import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Brain, MessageSquare, Zap } from 'lucide-react'

export default function LLMPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">LLM Agent</h1>
        <p className="text-muted-foreground">
          AI-powered trading assistant and analysis engine
        </p>
      </div>

      {/* Coming Soon Hero */}
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">AI Agent Coming Soon</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            We're building an advanced AI agent powered by CedarOS that will provide 
            real-time trading insights, pattern analysis, and personalized recommendations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-medium mb-2">Natural Language Queries</h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about your trading patterns in plain English
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-medium mb-2">Intelligent Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced pattern recognition and behavioral analysis
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-medium mb-2">Real-time Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get instant feedback and recommendations as you trade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Planned Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Conversational trade analysis</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Automated pattern detection</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Risk assessment and alerts</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Personalized trading strategies</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Market sentiment analysis</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Integration Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
              <div className="text-muted-foreground mb-2">Example conversation:</div>
              <div className="space-y-2">
                <div>
                  <span className="text-blue-600 dark:text-blue-400">You:</span> 
                  <span className="ml-2">Why did I lose money on AAPL trades last week?</span>
                </div>
                <div>
                  <span className="text-emerald-600 dark:text-emerald-400">AI:</span> 
                  <span className="ml-2">I analyzed your AAPL trades and found you entered positions during high volatility periods without proper risk management...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}