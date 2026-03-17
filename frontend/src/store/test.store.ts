import { create } from 'zustand'
import type { TestSession, TestResult } from '@/types'

interface TestState {
  session: TestSession | null
  result: TestResult | null
  timeRemaining: number  // seconds
  setSession: (session: TestSession) => void
  setAnswer: (questionId: string, answer: string | number | null) => void
  toggleFlag: (questionId: string) => void
  setTimeRemaining: (seconds: number) => void
  setResult: (result: TestResult) => void
  clearSession: () => void
}

export const useTestStore = create<TestState>((set) => ({
  session: null,
  result: null,
  timeRemaining: 0,

  setSession: (session) =>
    set({ session, timeRemaining: session.durationMinutes * 60 }),

  setAnswer: (questionId, answer) =>
    set((state) => {
      if (!state.session) return state
      return {
        session: {
          ...state.session,
          answers: { ...state.session.answers, [questionId]: answer },
        },
      }
    }),

  toggleFlag: (questionId) =>
    set((state) => {
      if (!state.session) return state
      const flagged = new Set(state.session.flagged)
      flagged.has(questionId) ? flagged.delete(questionId) : flagged.add(questionId)
      return { session: { ...state.session, flagged } }
    }),

  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),

  setResult: (result) => set({ result }),

  clearSession: () => set({ session: null, result: null, timeRemaining: 0 }),
}))
