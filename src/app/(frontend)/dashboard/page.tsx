'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../providers/AuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ImageCarousel from '../../../components/Media/ImageCarousel'
import VideoPlayer from '../../../components/Media/VideoPlayer'
import DocumentDownload from '../../../components/Media/DocumentDownload'
import RichText from '../../../components/RichText'
import QuizDisplay from '../../../components/Quiz/QuizDisplay'
import SessionList from '../../../components/Session/SessionList'
import FeedbackForm from '../../../components/Feedback/FeedbackForm'

export default function Dashboard() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [data, setData] = useState<{
        batches: any[];
        courses: any[];
        quizzes: any[];
        sessions: any[];
        dailyQuizzes: any[];
    }>({
        batches: [],
        courses: [],
        quizzes: [],
        sessions: [],
        dailyQuizzes: []
    })
    const [loadingData, setLoadingData] = useState(true)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/')
            return
        }

        const fetchData = async () => {
            if (user) {
                try {
                    const batchId = typeof user.batch === 'string' ? user.batch : user.batch?.id

                    let batchData = null
                    let coursesData: any[] = []
                    let sessionsData: any[] = []
                    let quizzesData: any[] = []
                    let dailyQuizzesData: any[] = []

                    if (batchId) {
                        // 1. Fetch Batch
                        const batchRes = await fetch(`/api/batches/${batchId}`)
                        batchData = await batchRes.json()

                        // 2. Fetch Courses
                        if (batchData.course) {
                            const courseIds = Array.isArray(batchData.course)
                                ? batchData.course.map((c: any) => typeof c === 'string' ? c : c.id)
                                : [typeof batchData.course === 'string' ? batchData.course : batchData.course.id]

                            // Fetch full course objects
                            const coursesRes = await fetch(`/api/courses?where[id][in]=${courseIds.join(',')}&depth=2`)
                            const coursesJson = await coursesRes.json()
                            coursesData = coursesJson.docs
                        }

                        // 3. Fetch Sessions (active/upcoming)
                        const sessionsRes = await fetch(`/api/sessions?where[batch][equals]=${batchId}&sort=-createdAt`)
                        const sessionsJson = await sessionsRes.json()
                        sessionsData = sessionsJson.docs

                        // 4. Fetch Daily Quizzes
                        const dailyRes = await fetch(`/api/daily-quizzes?where[batch][equals]=${batchId}&sort=-date`)
                        const dailyJson = await dailyRes.json()
                        dailyQuizzesData = dailyJson.docs
                    }

                    // 5. Fetch General Quizzes (if assigned directly, though usually via Session or Course)
                    // For now, we can fetch some sample quizzes or those related to the user's batch if schema allows.
                    // Assuming quizzes might be linked via courses or sessions.
                    // Let's just fetch recent quizzes for demo purposes if no specific relation exists yet in `Users`
                    // But to be "no dummy data", we strictly stick to relations.

                    setData({
                        batches: batchData ? [batchData] : [],
                        courses: coursesData,
                        sessions: sessionsData,
                        quizzes: quizzesData,
                        dailyQuizzes: dailyQuizzesData
                    })

                } catch (error) {
                    console.error('Failed to fetch dashboard data', error)
                } finally {
                    setLoadingData(false)
                }
            }
        }

        if (user) fetchData()
    }, [user, isLoading, router])

    if (isLoading || loadingData) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    if (!user) return null

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.displayName || user.email?.split('@')[0]} 👋</h1>
                    <p className="text-gray-500 mt-1">Here is your learning summary for today.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Last Login:</span> {new Date().toLocaleDateString()}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Courses & Batches */}
                <div className="lg:col-span-2 space-y-10">

                    {/* Active Batches */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">📅</span>
                            Active Batch
                        </h2>
                        {data.batches.length > 0 ? (
                            <div className="space-y-4">
                                {data.batches.map((batch) => (
                                    <div key={batch.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <span className="text-9xl">🎓</span>
                                        </div>
                                        <div className="relative z-10">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{batch.name}</h3>
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${batch.status === 'open' ? 'bg-green-100 text-green-700' :
                                                        batch.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {batch.status}
                                                </span>
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    Starts: {new Date(batch.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed">
                                <p className="text-gray-500">You are not enrolled in any batches yet.</p>
                            </div>
                        )}
                    </section>

                    {/* My Courses */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="p-2 bg-purple-100 text-purple-600 rounded-lg">📚</span>
                            My Courses
                        </h2>
                        {data.courses.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-6">
                                {data.courses.map((course) => (
                                    <div key={course.id} className="group bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                                        <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                            {course.images && course.images.length > 0 ? (
                                                <ImageCarousel images={course.images} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                    <span className="text-4xl">📷</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 flex-1 flex flex-col">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>

                                            {/* Description snippet if needed */}
                                            {/* <div className="text-gray-500 text-sm line-clamp-2 mb-4">
                                                <RichText content={course.description} />
                                            </div> */}

                                            <div className="mt-auto space-y-4 pt-4">
                                                {course.pdfs && course.pdfs.length > 0 && (
                                                    <div className="border-t pt-3">
                                                        <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Resources</p>
                                                        <DocumentDownload documents={course.pdfs} />
                                                    </div>
                                                )}

                                                <Link href={`/courses/${course.slug}`} className="block w-full py-2.5 text-center rounded-xl bg-gray-900 text-white font-medium hover:bg-black transition-transform hover:scale-[1.02] active:scale-[0.98]">
                                                    Start Learning
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed">
                                <p className="text-gray-500">No courses available.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Sidebar (Sessions, Quizzes, Progress) */}
                <div className="space-y-8">
                    {/* Sessions */}
                    <section className="bg-white border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="p-1.5 bg-red-100 text-red-600 rounded text-sm">🎥</span>
                            Live Sessions
                        </h2>
                        <SessionList sessions={data.sessions} />
                    </section>

                    {/* Daily Quiz */}
                    <section className="bg-white border rounded-2xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="p-1.5 bg-yellow-100 text-yellow-600 rounded text-sm">⚡</span>
                            Daily Challenge
                        </h2>
                        {data.dailyQuizzes.length > 0 ? (
                            <div className="space-y-6">
                                {data.dailyQuizzes.map((quiz, idx) => (
                                    <div key={quiz.id} className={idx > 0 ? "pt-6 border-t" : ""}>
                                        <div className="mb-2 flex justify-between items-center">
                                            <span className="text-xs font-medium text-gray-500">{new Date(quiz.date).toLocaleDateString()}</span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                {quiz.points || 1} Pts
                                            </span>
                                        </div>
                                        <QuizDisplay
                                            quizTitle="Today's Question"
                                            questions={[quiz]}
                                            isDaily={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-4">No daily quizzes for today.</p>
                        )}
                    </section>

                    {/* Feedback Prompt */}
                    <section className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-2 text-blue-900">Your Voice Matters!</h2>
                        <p className="text-sm text-blue-700 mb-4">Have you attended a recent session? Let us know what you think.</p>
                        <FeedbackForm eventName="General Feedback" />
                    </section>
                </div>
            </div>
        </div>
    )
}
