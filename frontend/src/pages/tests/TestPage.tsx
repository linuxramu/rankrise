import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { testService } from '@/services/test.service'
import { useTestStore } from '@/store/test.store'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatTime } from '@/lib/utils'
import type { Question } from '@/types'

export function TestPage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { session, setSession, setAnswer, toggleFlag, timeRemaining, setTimeRemaining, setResult, clearSession } = useTestStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!testId) return
    testService.startTest(testId).then(({ sessionId, questions }) => {
      setSession({
        testId,
        questions,
        startedAt: new Date().toISOString(),
        durationMinutes: 180, // will be overridden by actual test duration
        answers: {},
        flagged: new Set(),
      })
    })
    return () => clearSession()
  }, [testId])

  // Countdown timer
  useEffect(() => {
    if (!session) return
    timerRef.current = setInterval(() => {
      setTimeRemaining(Math.max(0, timeRemaining - 1))
      if (timeRemaining <= 1) handleSubmit()
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [session, timeRemaining])

  const handleSubmit = async () => {
    if (!session || !testId || submitting) return
    setSubmitting(true)
    if (timerRef.current) clearInterval(timerRef.current)
    const result = await testService.submitTest(testId, session.answers)
    setResult(result)
    navigate(`/results/${result.id}`)
  }

  if (!session) return <div className="flex h-64 items-center justify-center text-gray-500">Loading test...</div>

  const question: Question = session.questions[currentIndex]
  const answer = session.answers[question.id]
  const isFlagged = session.flagged.has(question.id)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-3">
        <span className="text-sm font-medium text-gray-700">
          Question {currentIndex + 1} / {session.questions.length}
        </span>
        <span className={`font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatTime(timeRemaining)}
        </span>
        <Button variant="danger" size="sm" onClick={handleSubmit} loading={submitting}>
          Submit Test
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Question panel */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <Card>
            <p className="text-sm text-gray-500 mb-2">{question.subject} · {question.topic}</p>
            <p className="text-gray-900">{question.text}</p>
          </Card>

          {/* MCQ options */}
          {question.type === 'MCQ' && question.options && (
            <div className="flex flex-col gap-2">
              {question.options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAnswer(question.id, opt.id)}
                  className={`rounded-lg border p-3 text-left text-sm transition-colors ${
                    answer === opt.id
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          )}

          {/* Numerical input */}
          {question.type === 'NUMERICAL' && (
            <input
              type="number"
              value={answer as number ?? ''}
              onChange={(e) => setAnswer(question.id, parseFloat(e.target.value))}
              placeholder="Enter numerical answer"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          )}

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => toggleFlag(question.id)}>
              {isFlagged ? '🚩 Unflag' : '🏳 Flag for review'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAnswer(question.id, null)}>
              Clear
            </Button>
          </div>
        </div>

        {/* Question palette */}
        <div className="w-56 overflow-y-auto border-l bg-white p-4">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500">Question Palette</p>
          <div className="grid grid-cols-5 gap-1">
            {session.questions.map((q, i) => {
              const isAnswered = session.answers[q.id] != null
              const isFlaggedQ = session.flagged.has(q.id)
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-8 w-8 rounded text-xs font-medium transition-colors ${
                    i === currentIndex ? 'ring-2 ring-primary-500' : ''
                  } ${
                    isFlaggedQ ? 'bg-yellow-400 text-white' :
                    isAnswered ? 'bg-green-500 text-white' :
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-500" /> Answered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-yellow-400" /> Flagged</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-gray-100 border" /> Not visited</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between border-t bg-white px-6 py-3">
        <Button variant="secondary" size="sm" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
          Previous
        </Button>
        <Button size="sm" onClick={() => setCurrentIndex(Math.min(session.questions.length - 1, currentIndex + 1))} disabled={currentIndex === session.questions.length - 1}>
          Next
        </Button>
      </div>
    </div>
  )
}
