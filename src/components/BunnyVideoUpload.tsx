'use client'

import React, { useState, useEffect } from 'react'
import { useField } from '@payloadcms/ui'

type Props = { path: string }

export const BunnyVideoUpload: React.FC<Props> = ({ path }) => {
    const { value, setValue } = useField<string>({ path })
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [uploadMessage, setUploadMessage] = useState<string | null>(null)
    const [libraryId, setLibraryId] = useState<string | null>(null)
    const [configError, setConfigError] = useState<boolean>(false)
    const [processingStatus, setProcessingStatus] = useState<number | null>(null) // 0-2=Processing, 3=Finished
    const [encodeProgress, setEncodeProgress] = useState<number>(0)

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
                        setLibraryId(String(data.libraryId)) // Ensure string
                    } else {
                        console.warn('[BunnyVideoUpload] No libraryId returned from config')
                        setConfigError(true)
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
                    // Status: 0=Created, 1=Uploaded, 2=Processing, 3=Transcoding, 4=Finished, 5=Error, 6=UploadFailed
                    // Actually Bunny API: 0=Queued, 1=Processing, 2=Encoding, 3=Finished, 4=Failed
                    // Let's trust the data.status
                    setProcessingStatus(data.status)
                    setEncodeProgress(data.encodeProgress || 0)

                    if (data.status === 3 || data.status === 4) { // Finished or static (legacy)
                        if (interval) clearInterval(interval)
                    }
                }
            } catch (e) {
                console.error("Failed to check status", e)
            }
        }

        if (value) {
            checkStatus()
            // Poll every 5s if we don't know status or it's processing (< 3)
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
        setProcessingStatus(0) // Reset to queued

        // Debug: Ensure path is valid before upload
        if (!path) {
            setError("Component Error: Missing field path. Cannot save.")
            setUploading(false)
            return
        }

        try {
            // 1. Get presigned URL and video ID
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
            if (libId) setLibraryId(String(libId))

            setUploadMessage("Uploading to Bunny.net...")

            // 2. Upload using XHR for progress tracking
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
                    setProcessingStatus(1) // Assuming processing starts
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

    const isProcessing = processingStatus !== null && processingStatus < 3
    const isError = processingStatus === 5 || processingStatus === 6

    return (
        <div className="field-type">
            <label className="field-label">
                Bunny Video ID
                {configError && <span style={{ color: 'red', marginLeft: '10px' }}>(Config Error: Library ID Missing)</span>}
            </label>

            {/* Logic to show existing value or preview */}
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
                        style={{ display: 'inline-block', padding: '10px 20px', background: '#333', color: '#fff', borderRadius: '4px', cursor: 'pointer', marginBottom: '10px' }}
                    >
                        {uploading ? 'Uploading...' : 'Select Video to Upload'}
                    </label>

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
        </div>
    )
}
