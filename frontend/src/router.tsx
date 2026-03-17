import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { AuthGuard } from '@/components/guards/AuthGuard'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { TestListPage } from '@/pages/tests/TestListPage'
import { TestPage } from '@/pages/tests/TestPage'
import { ResultPage } from '@/pages/results/ResultPage'
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage'
import { LeaderboardPage } from '@/pages/leaderboard/LeaderboardPage'

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/tests', element: <TestListPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
          { path: '/leaderboard', element: <LeaderboardPage /> },
        ],
      },
      // Test page uses full screen layout (no navbar)
      { path: '/tests/:testId', element: <TestPage /> },
      { path: '/results/:resultId', element: <ResultPage /> },
    ],
  },
])
