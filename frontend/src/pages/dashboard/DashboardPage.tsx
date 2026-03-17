import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { analyticsService } from '@/services/analytics.service'
import { testService } from '@/services/test.service'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPercent, EXAM_LABELS } from '@/lib/utils'
import type { Analytics, TestResult } from '@/types'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [recentResults, setRecentResults] = useState<TestResult[]>([])

  useEffect(() => {
    analyticsService.getMyAnalytics().then(setAnalytics)
    testService.getMyResults().then((r) => setRecentResults(r.slice(0, 5)))
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
        <p className="text-sm text-gray-500">
          Target: {user?.targetExam ? EXAM_LABELS[user.targetExam] : '—'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Tests Taken', value: analytics?.testsAttempted ?? '—' },
          { label: 'Avg Score', value: analytics ? formatPercent(analytics.averageScore) : '—' },
          { label: 'Accuracy', value: analytics ? formatPercent(analytics.overallAccuracy) : '—' },
          { label: 'Best Rank', value: analytics?.bestRank ? `#${analytics.bestRank}` : '—' },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <p className="text-2xl font-bold text-primary-600">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        <Button as={Link} to="/tests">Browse Tests</Button>
        <Button variant="secondary" as={Link} to="/analytics">View Analytics</Button>
      </div>

      {/* Recent results */}
      <Card>
        <h2 className="mb-4 font-semibold text-gray-900">Recent Tests</h2>
        {recentResults.length === 0 ? (
          <p className="text-sm text-gray-500">No tests taken yet. <Link to="/tests" className="text-primary-600 hover:underline">Start one now.</Link></p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {recentResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{r.testId}</p>
                  <p className="text-xs text-gray-500">{new Date(r.submittedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={`${r.percentage.toFixed(1)}%`} variant={r.percentage >= 60 ? 'success' : 'warning'} />
                  <Badge label={`Rank #${r.rank}`} variant="info" />
                  <Link to={`/results/${r.id}`} className="text-xs text-primary-600 hover:underline">View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
