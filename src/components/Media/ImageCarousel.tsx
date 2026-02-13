'use client'

import React, { useState } from 'react'

interface ImageCarouselProps {
    images: {
        image: {
            url: string
            alt?: string
        }
    }[]
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0)

    if (!images || images.length === 0) return null

    return (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg group">
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
                {images.map((item, index) => (
                    <div key={index} className="min-w-full h-full relative">
                        <img
                            src={item.image.url}
                            alt={item.image.alt || `Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        ←
                    </button>
                    <button
                        onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveIndex(index)}
                                className={`w-2 h-2 rounded-full transition-colors ${index === activeIndex ? 'bg-white' : 'bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
