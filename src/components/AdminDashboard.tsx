import { getPayload } from 'payload'
import config from '../payload.config'
import React from 'react'
import { headers } from 'next/headers'
import {
    Users,
    BookOpen,
    Zap,
    Trophy,
    MessageSquare,
    MousePointer2,
    Calendar,
    Activity
} from 'lucide-react'

const AdminDashboard = async () => {
    const payload = await getPayload({ config })
    const { user } = await payload.auth({ headers: await headers() })

    // Fetch counts for all main collections
    const { totalDocs: usersCount } = await payload.count({ collection: 'users' })
    const { totalDocs: coursesCount } = await payload.count({ collection: 'courses' })
    const { totalDocs: workshopsCount } = await payload.count({ collection: 'workshops' })
    const { totalDocs: leadsCount } = await payload.count({ collection: 'leads' })
    const { totalDocs: feedbackCount } = await payload.count({ collection: 'feedback' })
    const { totalDocs: sessionCount } = await payload.count({ collection: 'sessions' })
    const { totalDocs: quizCount } = await payload.count({ collection: 'quizzes' })
    const { totalDocs: problemCount } = await payload.count({ collection: 'problems' })

    const { totalDocs: activeSessionsCount } = await payload.count({
        collection: 'sessions',
        where: {
            status: {
                equals: 'ACTIVE',
            },
        },
    })

    return (
        <div className="dashboard" style={{ padding: '2rem 1rem' }}>
            <div className="dashboard__header" style={{ marginBottom: '3rem', textAlign: 'left' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.025em', margin: 0 }}>
                    Overview
                </h1>
                <p style={{ color: '#666', fontSize: '1.125rem', marginTop: '0.5rem' }}>
                    Real-time performance metrics for NUAT Labs platform.
                </p>
            </div>

            <div
                className="dashboard__stats"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                }}
            >
                <StatsCard
                    title="Community"
                    value={usersCount}
                    label="Registered Learners"
                    icon={<Users size={24} />}
                    color="#a2bd43"
                />
                <StatsCard
                    title="Curriculum"
                    value={coursesCount}
                    label="Active Courses"
                    icon={<BookOpen size={24} />}
                    color="#0ea5e9"
                />
                <StatsCard
                    title="Leads & CRM"
                    value={leadsCount}
                    label="Untouched Leads"
                    icon={<MousePointer2 size={24} />}
                    color="#f59e0b"
                />
                <StatsCard
                    title="Workshops"
                    value={workshopsCount}
                    label="Scheduled Events"
                    icon={<Calendar size={24} />}
                    color="#ec4899"
                />
                <StatsCard
                    title="ZoiCode"
                    value={problemCount}
                    label="Practice Problems"
                    icon={<Zap size={24} />}
                    color="#8b5cf6"
                />
                <StatsCard
                    title="Quizzes"
                    value={quizCount}
                    label="Total Modules"
                    icon={<Trophy size={24} />}
                    color="#10b981"
                />
                <StatsCard
                    title="Experience"
                    value={feedbackCount}
                    label="User Feedbacks"
                    icon={<MessageSquare size={24} />}
                    color="#6366f1"
                />
                <StatsCard
                    title="Live Activity"
                    value={activeSessionsCount}
                    label="Current Learners"
                    icon={<Activity size={24} />}
                    color="#ef4444"
                    active={activeSessionsCount > 0}
                />
            </div>
        </div>
    )
}

const StatsCard = ({
    title,
    value,
    label,
    icon,
    color,
    active,
}: {
    title: string
    value: number
    label: string
    icon: React.ReactNode
    color: string
    active?: boolean
}) => {
    return (
        <div
            className="stats-card"
            style={{
                padding: '2rem',
                borderRadius: '24px',
                border: '1px solid #f3f4f6',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '100px',
                height: '100px',
                background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                }}
            >
                <div style={{
                    padding: '0.75rem',
                    borderRadius: '12px',
                    backgroundColor: `${color}10`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                {active && (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: '#22c55e',
                            backgroundColor: '#22c55e10',
                            padding: '4px 10px',
                            borderRadius: '20px'
                        }}
                    >
                        <span style={{ height: '6px', width: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                        LIVE
                    </span>
                )}
            </div>

            <div style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {title}
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0.5rem 0', color: '#111827' }}>
                {value}
            </div>

            <div style={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: '500' }}>
                {label}
            </div>
        </div>
    )
}

export default AdminDashboard
