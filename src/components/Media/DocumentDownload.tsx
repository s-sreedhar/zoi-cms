'use client'

import React from 'react'

interface DocumentDownloadProps {
    documents: {
        pdf: {
            url: string
            filename: string
            filesize?: number
        }
    }[]
}

export default function DocumentDownload({ documents }: DocumentDownloadProps) {
    if (!documents || documents.length === 0) return null

    return (
        <div className="grid gap-3 my-6">
            {documents.map((doc, index) => (
                <a
                    key={index}
                    href={doc.pdf.url}
                    download
                    className="flex items-center gap-4 p-4 border rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                    <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold">
                        PDF
                    </div>
                    <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-700">
                            {doc.pdf.filename}
                        </h4>
                        {doc.pdf.filesize && (
                            <p className="text-xs text-gray-500">
                                {(doc.pdf.filesize / 1024 / 1024).toFixed(2)} MB
                            </p>
                        )}
                    </div>
                    <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Download ↓
                    </span>
                </a>
            ))}
        </div>
    )
}
