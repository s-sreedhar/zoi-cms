import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.redirect(new URL('/api/health', process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:8080'))
}
