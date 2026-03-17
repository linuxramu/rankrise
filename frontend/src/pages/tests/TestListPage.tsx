import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { testService } from '@/services/test.service'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EXAM_LABELS } from '@/lib/utils'
import type { Test, ExamType } from '@/types'

const EXAM_FILTERS: { label: string; value: ExamType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'JEE Mains', value: 'JEE_MAINS' },
  { label: 'JEE Advanced', value: 'JEE_ADVANCED' },
  { label: 'NEET', value: 'NEET' },
  { label: 'EAPCET', value: 'EAPCET' },
]

export function TestListPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [examFilter, setExamFilter] = useState<ExamType | 'ALL'>('ALL')

  useEffect(() => {
    const params = examFilter !== 'ALL' ? { exam: examFilter } : undefined
    testService.listTests(params).then(setTests)
  }, [examFilter])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Tests</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {EXAM_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setExamFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              examFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Test cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <h2 className="font-semibold text-gray-900">{test.title}</h2>
              <Badge label={EXAM_LABELS[test.exam]} variant="info" />
            </div>
            <div className="flex gap-2 text-xs text-gray-500">
              <span>{test.totalQuestions} questions</span>
              <span>·</span>
              <span>{test.durationMinutes} min</span>
              <span>·</span>
              <span>{test.totalMarks} marks</span>
            </div>
            <Button as={Link} to={`/tests/${test.id}`} size="sm" className="mt-auto">
              Start Test
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
