'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'


type Props = { path: string }

type BunnyVideo = {
    guid: string
    title: string
    dateUploaded: string
    thumbnailFileName: string
}

const VideoPickerModal = ({
    isOpen,
    onClose,
    onSelect,
    cdnHostname
}: {
    isOpen: boolean
    onClose: () => void
    onSelect: (videoId: string) => void
    cdnHostname: string | null
}) => {
    const [videos, setVideos] = useState<BunnyVideo[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)

    const fetchVideos = async (pageNum: number, searchTerm: string, reset: boolean = false) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/bunny/videos?page=${pageNum}&search=${encodeURIComponent(searchTerm)}&itemsPerPage=12`)
            const data = await res.json()

            // Bunny API returns { items: [], totalItems: number } OR just []
            const newVideos = Array.isArray(data) ? data : (data.items || [])

            if (reset) {
                setVideos(newVideos)
            } else {
                setVideos(prev => [...prev, ...newVideos])
            }

            setHasMore(newVideos.length === 12)
        } catch (error) {
            console.error('Failed to fetch videos:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchVideos(1, '', true)
            setPage(1)
            setSearch('')
        }
    }, [isOpen])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchVideos(1, search, true)
    }

    const loadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchVideos(nextPage, search)
    }

    if (!isOpen) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
        }}>
            <div style={{
                backgroundColor: 'var(--theme-elevation-50)',
                color: 'var(--theme-elevation-800)',
                width: '100%',
                maxWidth: '900px',
                height: '80vh',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid var(--theme-elevation-150)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--theme-text-primary)' }}>Select Video from Library</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'var(--theme-text-primary)'
                        }}
                    >
                        &times;
                    </button>
                </div>

                <div style={{ padding: '1rem', borderBottom: '1px solid var(--theme-elevation-150)' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                borderRadius: '4px',
                                border: '1px solid var(--theme-elevation-200)',
                                background: 'var(--theme-bg)',
                                color: 'var(--theme-text-primary)'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                background: 'var(--theme-primary-500)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.5rem',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    alignContent: 'start'
                }}>
                    {videos.map((video) => (
                        <div
                            key={video.guid}
                            onClick={() => onSelect(video.guid)}
                            style={{
                                cursor: 'pointer',
                                border: '1px solid var(--theme-elevation-150)',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                                backgroundColor: 'var(--theme-elevation-100)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{
                                position: 'relative',
                                paddingTop: '56.25%',
                                backgroundColor: '#000'
                            }}>
                                <img
                                    src={cdnHostname ? `https://${cdnHostname}/${video.guid}/${video.thumbnailFileName}` : `https://bn-1.net/${video.thumbnailFileName}`}
                                    alt={video.title}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiPjxwYXRoIGQ9Ik0xNSAxMGw1IDUtNSA1VjEwem0tNCAydjZoLTRWMTJoMnoiLz48L3N2Zz4=';
                                        (e.target as HTMLImageElement).style.padding = '20%'
                                    }}
                                />
                            </div>
                            <div style={{ padding: '0.75rem' }}>
                                <div style={{
                                    fontWeight: 500,
                                    marginBottom: '0.25rem',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    color: 'var(--theme-text-primary)'
                                }}>
                                    {video.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--theme-text-secondary)' }}>
                                    {(() => {
                                        const dateStr = video.dateUploaded || (video as any).date || (video as any).creationDate;
                                        return dateStr ? new Date(dateStr).toLocaleDateString() : 'Unknown Date';
                                    })()}
                                </div>
                            </div>
                        </div>
                    ))}

                    {videos.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: 'var(--theme-text-secondary)' }}>
                            No videos found
                        </div>
                    )}
                </div>

                {hasMore && (
                    <div style={{ padding: '1rem', borderTop: '1px solid var(--theme-elevation-150)', textAlign: 'center' }}>
                        <button
                            onClick={loadMore}
                            disabled={loading}
                            style={{
                                padding: '8px 16px',
                                background: 'transparent',
                                border: '1px solid var(--theme-elevation-200)',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: 'var(--theme-text-primary)'
                            }}
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export const BunnyVideoUpload: React.FC<Props> = ({ path }) => {
    const { value, setValue } = useField<string>({ path })
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [uploadMessage, setUploadMessage] = useState<string | null>(null)
    const [libraryId, setLibraryId] = useState<string | null>(null)
    const [cdnHostname, setCdnHostname] = useState<string | null>(null)
    const [configError, setConfigError] = useState<boolean>(false)
    const [processingStatus, setProcessingStatus] = useState<number | null>(null)
    const [encodeProgress, setEncodeProgress] = useState<number>(0)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Debug log
    useEffect(() => {
        console.log('[BunnyVideoUpload] Mounted with path:', path, 'Value:', value)
    }, [path, value])

    // Fetch config on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('/api/bunny/config')
                if (res.ok) {
                    const data = await res.json()
                    if (data.libraryId) {
                        setLibraryId(`${data.libraryId}`)
                    } else {
                        console.warn('[BunnyVideoUpload] No libraryId returned from config')
                        setConfigError(true)
                    }
                    if (data.cdnHostname) {
                        setCdnHostname(data.cdnHostname)
                    }
                } else {
                    console.error('[BunnyVideoUpload] Config fetch failed:', res.status)
                    setConfigError(true)
                }
            } catch (e) {
                console.error("[BunnyVideoUpload] Failed to fetch library ID", e)
                setConfigError(true)
            }
        }
        fetchConfig()
    }, [])

    // Poll status if value exists and not finished
    useEffect(() => {
        let interval: NodeJS.Timeout

        const checkStatus = async () => {
            if (!value) return

            try {
                const res = await fetch(`/api/bunny/status?videoId=${value}`)
                if (res.ok) {
                    const data = await res.json()
                    setProcessingStatus(data.status)
                    setEncodeProgress(data.encodeProgress || 0)

                    if (data.status === 3 || data.status === 4) {
                        if (interval) clearInterval(interval)
                    }
                }
            } catch (e) {
                console.error("Failed to check status", e)
            }
        }

        if (value) {
            checkStatus()
            interval = setInterval(checkStatus, 5000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [value])


    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)
        setUploadMessage("Initializing upload...")
        setProgress(0)
        setProcessingStatus(0)

        if (!path) {
            setError("Component Error: Missing field path. Cannot save.")
            setUploading(false)
            return
        }

        try {
            const res = await fetch('/api/bunny/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: file.name }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Failed to get upload URL')
            }

            const { videoId, authorizationSignature, libraryId: libId } = await res.json()
            if (libId) setLibraryId(`${libId}`)

            setUploadMessage("Uploading to Bunny.net...")

            const xhr = new XMLHttpRequest()
            xhr.open('PUT', `https://video.bunnycdn.com/library/${libId}/videos/${videoId}`, true)
            xhr.setRequestHeader('AccessKey', authorizationSignature)
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')
            xhr.setRequestHeader('Accept', 'application/json')

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100
                    setProgress(Math.round(percentComplete))
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log('[BunnyVideoUpload] Upload success. Setting value:', videoId)
                    setValue(videoId)
                    setUploadMessage("Upload complete! Processing video...")
                    setUploading(false)
                    setProcessingStatus(1)
                } else {
                    setError('Upload failed: ' + xhr.statusText)
                    setUploading(false)
                }
            }

            xhr.onerror = () => {
                setError('Network error during upload')
                setUploading(false)
            }

            xhr.send(file)

        } catch (err: any) {
            console.error(err)
            setError(err.message || "An unexpected error occurred")
            setUploading(false)
        }
    }

    const handleSelectVideo = (videoId: string) => {
        setValue(videoId)
        setIsModalOpen(false)
        setProcessingStatus(null) // Reset status to trigger check
    }

    const isProcessing = processingStatus !== null && processingStatus < 3
    const isError = processingStatus === 5 || processingStatus === 6

    return (
        <div className="field-type">
            <label className="field-label">
                Bunny Video ID
                {configError && <span style={{ color: 'red', marginLeft: '10px' }}>(Config Error: Library ID Missing)</span>}
            </label>

            {value && (
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>
                        ID: {value}
                        {isProcessing && <span style={{ color: 'orange', marginLeft: '10px' }}>Processing ({encodeProgress}%)</span>}
                        {processingStatus === 3 && <span style={{ color: 'green', marginLeft: '10px' }}>Ready</span>}
                        {isError && <span style={{ color: 'red', marginLeft: '10px' }}>Processing Failed</span>}
                    </div>

                    {libraryId ? (
                        <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                            {isProcessing ? (
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexDirection: 'column' }}>
                                    <div style={{ marginBottom: '10px' }}>Video is processing...</div>
                                    <div style={{ width: '50%', height: '4px', background: '#333', borderRadius: '2px' }}>
                                        <div style={{ width: `${encodeProgress}%`, height: '100%', background: '#4caf50', transition: 'width 0.5s' }}></div>
                                    </div>
                                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#aaa' }}>This may take a few minutes.</div>
                                </div>
                            ) : (
                                <iframe
                                    src={`https://iframe.mediadelivery.net/embed/${libraryId}/${value}?autoplay=false&loop=false&muted=false&preload=true`}
                                    loading="lazy"
                                    style={{ border: 'none', position: 'absolute', top: 0, height: '100%', width: '100%' }}
                                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                    allowFullScreen={true}
                                ></iframe>
                            )}
                        </div>
                    ) : (
                        <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '4px', textAlign: 'center' }}>
                            {configError ? "Cannot load preview (Library ID missing)" : "Loading preview..."}
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setValue(null) }}
                        style={{ marginTop: '10px', padding: '5px 10px', background: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Remove / Replace Video
                    </button>
                </div>
            )}

            {!value && (
                <div style={{ border: '2px dashed #ccc', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>

                        {/* Option 1: Upload */}
                        <div style={{ width: '100%' }}>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                                id={`bunny-upload-${path}`}
                            />
                            <label
                                htmlFor={`bunny-upload-${path}`}
                                style={{
                                    display: 'inline-block',
                                    padding: '12px 24px',
                                    background: '#333',
                                    color: '#fff',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    width: '100%',
                                    maxWidth: '300px',
                                    textAlign: 'center'
                                }}
                            >
                                {uploading ? 'Uploading...' : 'Upload New Video'}
                            </label>
                        </div>

                        <div style={{ color: '#999', fontSize: '0.9rem' }}>- OR -</div>

                        {/* Option 2: Select from Library */}
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); setIsModalOpen(true); }}
                            disabled={uploading}
                            style={{
                                padding: '12px 24px',
                                background: '#f0f0f0',
                                color: '#333',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                width: '100%',
                                maxWidth: '300px'
                            }}
                        >
                            Select from Library
                        </button>
                    </div>

                    {uploading && (
                        <div style={{ marginTop: '15px' }}>
                            <div style={{ marginBottom: '5px' }}>{uploadMessage} ({progress}%)</div>
                            <div style={{ width: '100%', height: '10px', background: '#eee', borderRadius: '5px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', background: '#4caf50', width: `${progress}%`, transition: 'width 0.2s' }}></div>
                            </div>
                        </div>
                    )}

                    {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
                </div>
            )}

            <VideoPickerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelectVideo}
                cdnHostname={cdnHostname}
            />
        </div>
    )
}
