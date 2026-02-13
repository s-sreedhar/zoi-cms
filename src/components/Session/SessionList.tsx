'use client'

import React from 'react'

interface Session {
    id: string
    title: string
    status: 'WAITING' | 'ACTIVE' | 'FINISHED'
    mode: 'INTERACTIVE' | 'DIY'
    startedAt?: string
    endedAt?: string
    host?: {
        displayName: string
    }
}

interface SessionListProps {
    sessions: Session[]
}

export default function SessionList({ sessions }: SessionListProps) {
    if (!sessions || sessions.length === 0) {
        return <p className="text-gray-500">No active sessions.</p>
    }

    return (
        <div className="grid gap-4">
            {sessions.map((session) => (
                <div key={session.id} className="border rounded-xl p-5 bg-white shadow-sm flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{session.title}</h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${session.status === 'ACTIVE' ? 'bg-green-100 text-green-700 animate-pulse' :
                                    session.status === 'WAITING' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                }`}>
                                {session.status}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                                {session.mode}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">Hosted by: {session.host?.displayName || 'Instructor'}</p>
                    </div>

                    <button
                        disabled={session.status === 'FINISHED'}
                        className={`px-4 py-2 rounded-lg transition-colors ${session.status === 'ACTIVE'
                                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200'
                                : session.status === 'WAITING'
                                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {session.status === 'ACTIVE' ? 'Join Now' : session.status === 'WAITING' ? 'Waiting Room' : 'Completed'}
                    </button>
                </div>
            ))}
        </div>
    )
}
