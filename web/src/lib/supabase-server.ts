import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './database.types'
import { createMockClient } from './supabase-mock'

const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'

export const createClient = () => {
  if (USE_MOCK_AUTH) {
    return createMockClient()
  }
  return createServerComponentClient<Database>({ cookies })
}