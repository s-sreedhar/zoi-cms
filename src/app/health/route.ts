import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const baseUrl = process.env.PAYLOAD_PUBLIC_SERVER_URL || req.url
    return NextResponse.redirect(new URL('/api/health', baseUrl))
}
