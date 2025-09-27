import { User } from '@supabase/supabase-js'

// Mock user data for testing
const MOCK_USER: User = {
  id: 'mock-user-id',
  email: 'demo@tradegist.com',
  app_metadata: {},
  user_metadata: { name: 'Demo User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

// Mock session data
const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: MOCK_USER,
}

export class MockSupabaseClient {
  auth = {
    user: MOCK_USER,
    session: MOCK_SESSION,
    
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // Always succeed with mock user
      return { data: { user: MOCK_USER, session: MOCK_SESSION }, error: null }
    },
    
    signUp: async ({ email, password }: { email: string; password: string }) => {
      // Always succeed with mock user
      return { data: { user: MOCK_USER, session: MOCK_SESSION }, error: null }
    },
    
    signOut: async () => {
      // Mock sign out
      return { error: null }
    },
    
    getUser: async () => {
      return { data: { user: MOCK_USER }, error: null }
    },
    
    getSession: async () => {
      return { data: { session: MOCK_SESSION }, error: null }
    },
    
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      // Immediately call with mock session
      callback('SIGNED_IN', MOCK_SESSION)
      return { data: { subscription: { unsubscribe: () => {} } } }
    }
  }
  
  from = () => this
  select = () => this
  eq = () => this
  single = async () => ({ data: null, error: null })
  order = () => this
  limit = () => this
}

export const createMockClient = () => new MockSupabaseClient() as any