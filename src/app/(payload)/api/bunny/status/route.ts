import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const videoId = searchParams.get('videoId')

    const apiKey = process.env.BUNNY_API_KEY
    const libraryId = process.env.BUNNY_LIBRARY_ID

    if (!apiKey || !libraryId) {
        return NextResponse.json({ error: 'Bunny.net credentials not configured' }, { status: 500 })
    }

    if (!videoId) {
        return NextResponse.json({ error: 'Video ID is required' }, { status: 400 })
    }

    try {
        const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
            method: 'GET',
            headers: {
                AccessKey: apiKey,
                'Accept': 'application/json',
            },
        })

        if (!res.ok) {
            const err = await res.json()
            return NextResponse.json({ error: err.message || 'Failed to fetch video status' }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Bunny Status Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
