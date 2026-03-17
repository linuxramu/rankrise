import type { User, Test, TestResult, Analytics } from '@/types'

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Shreshti',
  email: 'shreshti@example.com',
  targetExam: 'JEE_MAINS',
  createdAt: '2026-01-01T00:00:00Z',
}

export const MOCK_TESTS: Test[] = [
  {
    id: 'test-1',
    title: 'JEE Mains Full Mock #1',
    exam: 'JEE_MAINS',
    type: 'FULL_LENGTH',
    durationMinutes: 180,
    totalQuestions: 90,
    totalMarks: 300,
    subjects: [],
  },
  {
    id: 'test-2',
    title: 'Physics Unit Test — Mechanics',
    exam: 'JEE_MAINS',
    type: 'UNIT_WISE',
    durationMinutes: 60,
    totalQuestions: 30,
    totalMarks: 120,
    subjects: [],
  },
  {
    id: 'test-3',
    title: 'NEET Biology Mock #1',
    exam: 'NEET',
    type: 'FULL_LENGTH',
    durationMinutes: 200,
    totalQuestions: 180,
    totalMarks: 720,
    subjects: [],
  },
  {
    id: 'test-4',
    title: 'Chemistry — Organic Basics',
    exam: 'JEE_ADVANCED',
    type: 'SUBJECT_WISE',
    durationMinutes: 90,
    totalQuestions: 40,
    totalMarks: 160,
    subjects: [],
  },
  {
    id: 'test-5',
    title: 'EAPCET Full Mock #1',
    exam: 'EAPCET',
    type: 'FULL_LENGTH',
    durationMinutes: 180,
    totalQuestions: 160,
    totalMarks: 160,
    subjects: [],
  },
]

export const MOCK_QUESTIONS = Array.from({ length: 10 }, (_, i) => ({
  id: `q-${i + 1}`,
  text: `Sample Question ${i + 1}: What is the value of the expression when x = ${i + 2}?`,
  type: i % 3 === 0 ? ('NUMERICAL' as const) : ('MCQ' as const),
  options: i % 3 !== 0 ? [
    { id: 'a', text: `Option A — ${i * 2}` },
    { id: 'b', text: `Option B — ${i * 3}` },
    { id: 'c', text: `Option C — ${i * 4}` },
    { id: 'd', text: `Option D — ${i * 5}` },
  ] : undefined,
  marks: 4,
  negativeMarks: 1,
  subject: 'Physics',
  topic: 'Mechanics',
}))

export const MOCK_RESULT: TestResult = {
  id: 'result-1',
  testId: 'test-1',
  userId: 'user-1',
  score: 212,
  totalMarks: 300,
  percentage: 70.6,
  rank: 42,
  totalParticipants: 1280,
  timeTaken: 9800,
  submittedAt: new Date().toISOString(),
  subjectWise: [
    { subject: 'Physics', score: 76, total: 100, correct: 19, incorrect: 3, unattempted: 8 },
    { subject: 'Chemistry', score: 68, total: 100, correct: 17, incorrect: 4, unattempted: 9 },
    { subject: 'Mathematics', score: 68, total: 100, correct: 17, incorrect: 5, unattempted: 8 },
  ],
  questions: MOCK_QUESTIONS.map((q, i) => ({
    questionId: q.id,
    userAnswer: i % 3 === 0 ? 42 : 'a',
    correctAnswer: i % 3 === 0 ? 42 : i % 2 === 0 ? 'a' : 'b',
    isCorrect: i % 2 === 0,
    marksAwarded: i % 2 === 0 ? 4 : -1,
    explanation: `This is the explanation for question ${i + 1}. The correct approach involves substituting the given values and simplifying.`,
  })),
}

export const MOCK_ANALYTICS: Analytics = {
  overallAccuracy: 68.4,
  testsAttempted: 12,
  averageScore: 71.2,
  bestRank: 18,
  trend: [
    { date: 'Jan 1', score: 180, percentage: 60, testTitle: 'Mock #1' },
    { date: 'Jan 8', score: 195, percentage: 65, testTitle: 'Mock #2' },
    { date: 'Jan 15', score: 188, percentage: 62.6, testTitle: 'Mock #3' },
    { date: 'Jan 22', score: 210, percentage: 70, testTitle: 'Mock #4' },
    { date: 'Feb 1', score: 222, percentage: 74, testTitle: 'Mock #5' },
    { date: 'Feb 10', score: 212, percentage: 70.6, testTitle: 'Mock #6' },
  ],
  topicAccuracy: [
    { topic: 'Mechanics', subject: 'Physics', accuracy: 78, attempted: 45 },
    { topic: 'Thermodynamics', subject: 'Physics', accuracy: 55, attempted: 30 },
    { topic: 'Organic Chemistry', subject: 'Chemistry', accuracy: 62, attempted: 40 },
    { topic: 'Calculus', subject: 'Mathematics', accuracy: 80, attempted: 50 },
    { topic: 'Algebra', subject: 'Mathematics', accuracy: 72, attempted: 38 },
    { topic: 'Electrostatics', subject: 'Physics', accuracy: 48, attempted: 25 },
    { topic: 'Inorganic Chemistry', subject: 'Chemistry', accuracy: 66, attempted: 35 },
    { topic: 'Coordinate Geometry', subject: 'Mathematics', accuracy: 58, attempted: 28 },
  ],
  weakTopics: [
    { topic: 'Electrostatics', subject: 'Physics', accuracy: 48, attempted: 25 },
    { topic: 'Thermodynamics', subject: 'Physics', accuracy: 55, attempted: 30 },
    { topic: 'Coordinate Geometry', subject: 'Mathematics', accuracy: 58, attempted: 28 },
  ],
  strongTopics: [
    { topic: 'Calculus', subject: 'Mathematics', accuracy: 80, attempted: 50 },
    { topic: 'Mechanics', subject: 'Physics', accuracy: 78, attempted: 45 },
    { topic: 'Algebra', subject: 'Mathematics', accuracy: 72, attempted: 38 },
  ],
}
