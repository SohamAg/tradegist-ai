import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // With mock auth, allow all requests to proceed
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/app/:path*',
  ],
}