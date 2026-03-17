import type { Analytics } from '@/types'
import { MOCK_ANALYTICS } from '@/lib/mock'

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

export const analyticsService = {
  getMyAnalytics: async (): Promise<Analytics> => {
    await delay()
    return MOCK_ANALYTICS
  },

  getLeaderboard: async (_testId: string) => {
    await delay()
    return [
      { rank: 1, userId: 'u1', name: 'Arjun Sharma', score: 285 },
      { rank: 2, userId: 'u2', name: 'Priya Nair', score: 271 },
      { rank: 3, userId: 'u3', name: 'Rohan Mehta', score: 264 },
      { rank: 4, userId: 'u4', name: 'Sneha Reddy', score: 258 },
      { rank: 5, userId: 'user-1', name: 'Shreshti', score: 212 },
    ]
  },
}
