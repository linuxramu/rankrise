import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { testService } from '@/services/test.service'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPercent } from '@/lib/utils'
import type { TestResult } from '@/types'

export function ResultPage() {
  const { resultId } = useParams<{ resultId: string }>()
  const [result, setResult] = useState<TestResult | null>(null)

  useEffect(() => {
    if (resultId) testService.getResult(resultId).then(setResult)
  }, [resultId])

  if (!result) return <div className="flex h-64 items-center justify-center text-gray-500">Loading results...</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
        <Button as={Link} to="/tests" variant="secondary" size="sm">Take Another Test</Button>
      </div>

      {/* Score summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Score', value: `${result.score}/${result.totalMarks}` },
          { label: 'Percentage', value: formatPercent(result.percentage) },
          { label: 'Rank', value: `#${result.rank} / ${result.totalParticipants}` },
          { label: 'Time Taken', value: `${Math.floor(result.timeTaken / 60)} min` },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-2xl font-bold text-primary-600">{s.value}</p>
            <p className="mt-1 text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Subject-wise breakdown */}
      <Card>
        <h2 className="mb-4 font-semibold text-gray-900">Subject-wise Performance</h2>
        <div className="flex flex-col gap-3">
          {result.subjectWise.map((s) => (
            <div key={s.subject}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{s.subject}</span>
                <span className="text-gray-500">{s.score}/{s.total}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-2 rounded-full bg-primary-500"
                  style={{ width: `${(s.score / s.total) * 100}%` }}
                />
              </div>
              <div className="mt-1 flex gap-3 text-xs text-gray-500">
                <span className="text-green-600">✓ {s.correct}</span>
                <span className="text-red-600">✗ {s.incorrect}</span>
                <span>— {s.unattempted}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Question-wise review */}
      <Card>
        <h2 className="mb-4 font-semibold text-gray-900">Question Review</h2>
        <div className="flex flex-col gap-4">
          {result.questions.map((q, i) => (
            <div key={q.questionId} className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Q{i + 1}</span>
                <Badge
                  label={q.isCorrect ? `+${q.marksAwarded}` : `${q.marksAwarded}`}
                  variant={q.isCorrect ? 'success' : q.userAnswer == null ? 'default' : 'danger'}
                />
              </div>
              <p className="text-xs text-gray-500">Your answer: {q.userAnswer ?? 'Not attempted'}</p>
              <p className="text-xs text-green-700">Correct: {q.correctAnswer}</p>
              {q.explanation && (
                <p className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-2">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
