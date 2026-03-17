import type { Test, TestResult } from '@/types'
import { MOCK_TESTS, MOCK_QUESTIONS, MOCK_RESULT } from '@/lib/mock'

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms))

export const testService = {
  listTests: async (params?: { exam?: string; type?: string }): Promise<Test[]> => {
    await delay()
    if (params?.exam) return MOCK_TESTS.filter((t) => t.exam === params.exam)
    return MOCK_TESTS
  },

  getTest: async (id: string): Promise<Test> => {
    await delay()
    return MOCK_TESTS.find((t) => t.id === id) ?? MOCK_TESTS[0]
  },

  startTest: async (_testId: string) => {
    await delay()
    return { sessionId: 'session-mock-1', questions: MOCK_QUESTIONS }
  },

  submitTest: async (_testId: string, _answers: Record<string, string | number | null>): Promise<TestResult> => {
    await delay(800)
    return MOCK_RESULT
  },

  getResult: async (_resultId: string): Promise<TestResult> => {
    await delay()
    return MOCK_RESULT
  },

  getMyResults: async (): Promise<TestResult[]> => {
    await delay()
    return [MOCK_RESULT]
  },
}
