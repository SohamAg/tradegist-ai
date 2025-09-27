import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'
import { createMockClient } from './supabase-mock'

// Use environment variable to toggle between real and mock auth
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'

export const createClient = () => {
  if (USE_MOCK_AUTH) {
    return createMockClient()
  }
  return createClientComponentClient<Database>()
}