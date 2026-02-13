'use client'

import React, { useState } from 'react'

interface FeedbackFormProps {
    eventName: string
    sessionId?: string
    quizId?: string
    onSubmitSuccess?: () => void
}

export default function FeedbackForm({ eventName, sessionId, quizId, onSubmitSuccess }: FeedbackFormProps) {
    const [rating, setRating] = useState(0)
    const [improvement, setImprovement] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return alert('Please provide a rating')

        setIsSubmitting(true)
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Anonymous', // Ideally fetch user name if Auth context available
                    event: eventName,
                    rating,
                    improvement,
                    sessionId,
                    quizId,
                })
            })
            setSubmitted(true)
            if (onSubmitSuccess) onSubmitSuccess()
        } catch (error) {
            console.error('Failed to submit feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="bg-green-50 p-6 rounded-xl text-center text-green-700">
                <p className="text-xl font-bold mb-2">Thank you!</p>
                <p>Your feedback helps us improve.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="text-lg font-bold mb-4">Feedback for {eventName}</h3>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Rate your experience</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">How can we improve?</label>
                <textarea
                    value={improvement}
                    onChange={(e) => setImprovement(e.target.value)}
                    className="w-full p-2 border rounded-lg h-24"
                    placeholder="Your suggestions..."
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
        </form>
    )
}
