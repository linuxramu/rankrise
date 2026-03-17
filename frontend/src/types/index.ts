// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string
  name: string
  email: string
  targetExam: ExamType
  createdAt: string
}

// ─── Exam ────────────────────────────────────────────────────────────────────

export type ExamType = 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'EAPCET'

export type TestType = 'FULL_LENGTH' | 'UNIT_WISE' | 'SUBJECT_WISE'

export interface Subject {
  id: string
  name: string
  exam: ExamType
}

export interface Topic {
  id: string
  name: string
  subjectId: string
}

// ─── Test ────────────────────────────────────────────────────────────────────

export interface Test {
  id: string
  title: string
  exam: ExamType
  type: TestType
  durationMinutes: number
  totalQuestions: number
  totalMarks: number
  subjects: Subject[]
}

export type QuestionType = 'MCQ' | 'NUMERICAL'

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  options?: Option[]
  marks: number
  negativeMarks: number
  subject: string
  topic: string
}

export interface TestSession {
  testId: string
  questions: Question[]
  startedAt: string
  durationMinutes: number
  answers: Record<string, string | number | null>  // questionId -> answer
  flagged: Set<string>
}

// ─── Results ─────────────────────────────────────────────────────────────────

export interface QuestionResult {
  questionId: string
  userAnswer: string | number | null
  correctAnswer: string | number
  isCorrect: boolean
  marksAwarded: number
  explanation: string
}

export interface TestResult {
  id: string
  testId: string
  userId: string
  score: number
  totalMarks: number
  percentage: number
  rank: number
  totalParticipants: number
  timeTaken: number
  submittedAt: string
  subjectWise: SubjectScore[]
  questions: QuestionResult[]
}

export interface SubjectScore {
  subject: string
  score: number
  total: number
  correct: number
  incorrect: number
  unattempted: number
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export interface PerformanceTrend {
  date: string
  score: number
  percentage: number
  testTitle: string
}

export interface TopicAccuracy {
  topic: string
  subject: string
  accuracy: number
  attempted: number
}

export interface Analytics {
  overallAccuracy: number
  testsAttempted: number
  averageScore: number
  bestRank: number
  trend: PerformanceTrend[]
  topicAccuracy: TopicAccuracy[]
  weakTopics: TopicAccuracy[]
  strongTopics: TopicAccuracy[]
}
