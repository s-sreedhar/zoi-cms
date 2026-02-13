'use client'

import React, { useState } from 'react'
import RichText from '../RichText'
import { useRouter } from 'next/navigation'

interface Question {
    type: 'MCQ' | 'MSQ' | 'TEXT' | 'NUMBER'
    richText: any // For Quiz collection
    question?: any // For DailyQuiz collection (legacy/different naming)
    image?: any
    options?: { option: string }[]
    correctAnswers?: string[]
    explanation?: any
    points?: number
}

interface QuizDisplayProps {
    quizTitle: string
    questions: Question[]
    isDaily?: boolean
    onComplete?: (score: number, totalPoints: number, answers: any[]) => void
}

export default function QuizDisplay({ quizTitle, questions, isDaily = false, onComplete }: QuizDisplayProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<string | string[]>([])
    const [textAnswer, setTextAnswer] = useState('')
    const [showExplanation, setShowExplanation] = useState(false)
    const [score, setScore] = useState(0)
    const [completed, setCompleted] = useState(false)
    const [allAnswers, setAllAnswers] = useState<any[]>([])

    const currentQuestion = questions[currentIndex]

    // Normalize question content (DailyQuiz uses 'question', Quiz uses 'richText')
    const questionContent = currentQuestion.richText || currentQuestion.question

    const handleOptionClick = (option: string) => {
        if (showExplanation) return

        if (currentQuestion.type === 'MCQ') {
            setSelectedAnswers(option)
        } else if (currentQuestion.type === 'MSQ') {
            const current = Array.isArray(selectedAnswers) ? selectedAnswers : []
            if (current.includes(option)) {
                setSelectedAnswers(current.filter(item => item !== option))
            } else {
                setSelectedAnswers([...current, option])
            }
        }
    }

    const handleSubmitAnswer = () => {
        let isCorrect = false
        const correct = currentQuestion.correctAnswers || []

        if (currentQuestion.type === 'MCQ') {
            isCorrect = correct.includes(selectedAnswers as string)
        } else if (currentQuestion.type === 'MSQ') {
            const selected = Array.isArray(selectedAnswers) ? selectedAnswers : []
            isCorrect = selected.length === correct.length && selected.every(val => correct.includes(val))
        } else {
            // Text/Number - simple exact match for now, or verification needed
            isCorrect = correct.includes(textAnswer)
        }

        if (isCorrect) {
            setScore(prev => prev + (currentQuestion.points || 1))
        }

        const answerRecord = {
            questionIndex: currentIndex,
            answer: currentQuestion.type === 'MCQ' || currentQuestion.type === 'MSQ' ? selectedAnswers : textAnswer,
            isCorrect
        }

        setAllAnswers(prev => [...prev, answerRecord])
        setShowExplanation(true)
    }

    const handleNext = () => {
        setShowExplanation(false)
        setSelectedAnswers([])
        setTextAnswer('')

        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            setCompleted(true)
            if (onComplete) {
                // Calculate total points
                const totalPoints = questions.reduce((acc, q) => acc + (q.points || 1), 0)
                onComplete(score, totalPoints, [...allAnswers]) // Note: allAnswers might miss the last one because of closure, fix logic below
            }
        }
    }

    if (completed) {
        return (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Quiz Completed!</h3>
                <p className="text-xl mb-6">Your Score: {score} / {questions.reduce((acc, q) => acc + (q.points || 1), 0)}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Back to Dashboard
                </button>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-3xl mx-auto">
            <div className="bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
                <h3 className="font-bold text-lg">{quizTitle}</h3>
                <span className="text-sm text-gray-500">Question {currentIndex + 1} of {questions.length}</span>
            </div>

            <div className="p-6">
                <div className="mb-6 prose max-w-none">
                    <RichText content={questionContent} />
                </div>

                {currentQuestion.image && (
                    <div className="mb-6">
                        {/* Handle Image object or ID */}
                        <img
                            src={typeof currentQuestion.image === 'string' ? currentQuestion.image : currentQuestion.image.url}
                            alt="Question Image"
                            className="max-h-64 rounded-lg mx-auto"
                        />
                    </div>
                )}

                <div className="space-y-3 mb-8">
                    {(currentQuestion.type === 'MCQ' || currentQuestion.type === 'MSQ') && currentQuestion.options?.map((opt, idx) => {
                        const val = typeof opt === 'string' ? opt : opt.option
                        const isSelected = Array.isArray(selectedAnswers)
                            ? selectedAnswers.includes(val)
                            : selectedAnswers === val

                        let optionClass = "w-full text-left p-4 rounded-lg border transition-all "

                        if (showExplanation) {
                            if (currentQuestion.correctAnswers?.includes(val)) {
                                optionClass += "bg-green-100 border-green-500 text-green-700"
                            } else if (isSelected) {
                                optionClass += "bg-red-100 border-red-500 text-red-700"
                            } else {
                                optionClass += "bg-gray-50 border-gray-200 opacity-50"
                            }
                        } else {
                            optionClass += isSelected
                                ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500"
                                : "hover:bg-gray-50 border-gray-200"
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(val)}
                                disabled={showExplanation}
                                className={optionClass}
                            >
                                {val}
                            </button>
                        )
                    })}

                    {(currentQuestion.type === 'TEXT' || currentQuestion.type === 'NUMBER') && (
                        <input
                            type={currentQuestion.type === 'NUMBER' ? 'number' : 'text'}
                            value={textAnswer}
                            onChange={(e) => setTextAnswer(e.target.value)}
                            disabled={showExplanation}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Type your answer here..."
                        />
                    )}
                </div>

                {showExplanation && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg text-blue-800">
                        <h4 className="font-bold mb-2">Explanation:</h4>
                        <RichText content={currentQuestion.explanation} />
                    </div>
                )}

                <div className="flex justify-end">
                    {!showExplanation ? (
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={!textAnswer && (Array.isArray(selectedAnswers) ? selectedAnswers.length === 0 : !selectedAnswers)}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Submit Answer
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition-colors"
                        >
                            {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
