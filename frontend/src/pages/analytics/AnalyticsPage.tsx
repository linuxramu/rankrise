import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { analyticsService } from '@/services/analytics.service'
import { Card } from '@/components/ui/Card'
import { formatPercent } from '@/lib/utils'
import type { Analytics } from '@/types'

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  useEffect(() => {
    analyticsService.getMyAnalytics().then(setAnalytics)
  }, [])

  if (!analytics) return <div className="flex h-64 items-center justify-center text-gray-500">Loading analytics...</div>

  const radarData = analytics.topicAccuracy.slice(0, 8).map((t) => ({
    topic: t.topic,
    accuracy: t.accuracy,
  }))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      {/* Score trend */}
      <Card>
        <h2 className="mb-4 font-semibold text-gray-900">Score Trend</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={analytics.trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Topic radar */}
      <Card>
        <h2 className="mb-4 font-semibold text-gray-900">Topic Accuracy</h2>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="topic" tick={{ fontSize: 11 }} />
            <Radar dataKey="accuracy" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      {/* Weak / Strong topics */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold text-red-600">Weak Topics</h2>
          <div className="flex flex-col gap-2">
            {analytics.weakTopics.map((t) => (
              <div key={t.topic} className="flex justify-between text-sm">
                <span className="text-gray-700">{t.topic}</span>
                <span className="text-red-600">{formatPercent(t.accuracy)}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold text-green-600">Strong Topics</h2>
          <div className="flex flex-col gap-2">
            {analytics.strongTopics.map((t) => (
              <div key={t.topic} className="flex justify-between text-sm">
                <span className="text-gray-700">{t.topic}</span>
                <span className="text-green-600">{formatPercent(t.accuracy)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
