import { getPayload } from 'payload'
import config from '../payload.config'
import React from 'react'
import { headers } from 'next/headers'

const AdminDashboard = async () => {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await headers() })

    // Fetch counts
    const { totalDocs: usersCount } = await payload.count({ collection: 'users' })
    const { totalDocs: workshopsCount } = await payload.count({ collection: 'workshops' })
    const { totalDocs: problemsCount } = await payload.count({ collection: 'problems' })

    // Active sessions count needs a where query
    const { totalDocs: activeSessionsCount } = await payload.count({
        collection: 'sessions',
        where: {
            status: {
                equals: 'ACTIVE',
            },
        },
    })

    return (
        <div className="dashboard">
            <div className="dashboard__header" style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard Overview</h1>
                <p style={{ color: '#666' }}>Platform Analytics & Insights (Real-Time)</p>
            </div>

            <div
                className="dashboard__stats"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                }}
            >
                <StatsCard title="Total Users" value={usersCount} label="Registered Learners" />
                <StatsCard title="Workshops" value={workshopsCount} label="Active Events" />
                <StatsCard title="ZoiCode Problems" value={problemsCount} label="Challenge Bank" />
                <StatsCard
                    title="Active Sessions"
                    value={activeSessionsCount}
                    label="Live Now"
                    active={activeSessionsCount > 0}
                />
            </div>

            {/* Fallback for Google Analytics/Looker Studio if needed later */}
        </div>
    )
}

const StatsCard = ({
    title,
    value,
    label,
    active,
}: {
    title: string
    value: number
    label: string
    active?: boolean
}) => {
    return (
        <div
            style={{
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                }}
            >
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280', margin: 0 }}>
                    {title}
                </h3>
                {active && (
                    <span
                        style={{
                            height: '8px',
                            width: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#22c55e',
                            display: 'inline-block',
                        }}
                    />
                )}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1' }}>{value}</div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                <span style={{ fontWeight: 'bold', color: '#0ea5e9' }}>{label}</span>
            </div>
        </div>
    )
}

export default AdminDashboard
