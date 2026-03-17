import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { analyticsService } from '@/services/analytics.service'
import { testService } from '@/services/test.service'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Test } from '@/types'

interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  score: number
}

export function LeaderboardPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedTestId = searchParams.get('testId') ?? ''

  useEffect(() => {
    testService.listTests().then(setTests)
  }, [])

  useEffect(() => {
    if (selectedTestId) {
      analyticsService.getLeaderboard(selectedTestId).then(setEntries)
    }
  }, [selectedTestId])

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>

      <select
        value={selectedTestId}
        onChange={(e) => setSearchParams({ testId: e.target.value })}
        className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
      >
        <option value="">Select a test</option>
        {tests.map((t) => (
          <option key={t.id} value={t.id}>{t.title}</option>
        ))}
      </select>

      {entries.length > 0 && (
        <Card>
          <div className="flex flex-col divide-y divide-gray-100">
            {entries.map((entry) => (
              <div key={entry.userId} className="flex items-center gap-4 py-3">
                <span className={`w-8 text-center font-bold ${
                  entry.rank === 1 ? 'text-yellow-500' :
                  entry.rank === 2 ? 'text-gray-400' :
                  entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  #{entry.rank}
                </span>
                <span className="flex-1 text-sm font-medium text-gray-900">{entry.name}</span>
                <Badge label={`${entry.score} pts`} variant="info" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
