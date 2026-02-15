import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const page = searchParams.get('page') || '1'
        const search = searchParams.get('search') || ''
        const itemsPerPage = searchParams.get('itemsPerPage') || '20'
        const collection = searchParams.get('collection') || ''

        const apiKey = process.env.BUNNY_API_KEY
        const libraryId = process.env.BUNNY_LIBRARY_ID

        if (!apiKey || !libraryId) {
            return NextResponse.json({ error: 'Bunny.net credentials not configured' }, { status: 500 })
        }

        // Build URL
        let url = `https://video.bunnycdn.com/library/${libraryId}/videos?page=${page}&itemsPerPage=${itemsPerPage}`

        if (search) {
            url += `&search=${encodeURIComponent(search)}`
        } else {
            url += `&orderBy=date`
        }

        if (collection) {
            url += `&collection=${collection}`
        }

        console.log(`[Bunny API] Fetching: ${url}`)

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                AccessKey: apiKey,
                'Accept': 'application/json',
            },
        })

        if (!res.ok) {
            const errorText = await res.text()
            console.error('Bunny API Error:', res.status, errorText)
            return NextResponse.json({ error: `Failed to fetch videos from Bunny.net: ${res.status}` }, { status: res.status })
        }

        const data = await res.json()
        return NextResponse.json(data)

    } catch (error: any) {
        console.error('Bunny List API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
