'use client'

import React from 'react'

interface VideoPlayerProps {
    url?: string // Direct URL
    embedId?: string // For Bunny/YouTube if needed
    platform?: 'bunny' | 'youtube' | 'vimeo' | 'html5'
}

export default function VideoPlayer({ url, embedId, platform = 'html5' }: VideoPlayerProps) {
    if (!url && !embedId) return null

    if (platform === 'bunny' && embedId) {
        return (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                <iframe
                    src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${embedId}?autoplay=false`}
                    loading="lazy"
                    className="w-full h-full border-0 absolute top-0 left-0"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                />
            </div>
        )
    }

    return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
            <video
                src={url}
                controls
                className="w-full h-full"
                poster="/video-poster-placeholder.jpg" // You might want to pass this as a prop
            >
                Your browser does not support the video tag.
            </video>
        </div>
    )
}
