import { NextResponse } from 'next/server'

export async function GET() {
    const libraryId = process.env.BUNNY_LIBRARY_ID
    if (!libraryId) {
        return NextResponse.json({ error: 'Bunny Library ID not configured' }, { status: 500 })
    }
    return NextResponse.json({ libraryId, cdnHostname: process.env.BUNNY_CDN_HOSTNAME })
}
