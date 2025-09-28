import { useState, useEffect } from 'react'
import { supabase, fixedUserId } from '../lib/supabase'

export default function DatabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing')
  const [error, setError] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('trades')
        .select('count')
        .eq('user_id', fixedUserId)
        .limit(1)

      if (error) {
        setConnectionStatus('error')
        setError(error.message)
      } else {
        setConnectionStatus('connected')
      }
    } catch (err) {
      setConnectionStatus('error')
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return (
    <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
      <h3 className="text-lg font-semibold text-white mb-2">Database Connection Test</h3>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          connectionStatus === 'connected' ? 'bg-success-400' :
          connectionStatus === 'error' ? 'bg-danger-400' :
          'bg-warning-400 animate-pulse'
        }`}></div>
        <span className="text-slate-300">
          {connectionStatus === 'connected' ? 'Connected to Supabase' :
           connectionStatus === 'error' ? `Error: ${error}` :
           'Testing connection...'}
        </span>
      </div>
      <p className="text-xs text-slate-400 mt-2">
        User ID: {fixedUserId}
      </p>
    </div>
  )
}
